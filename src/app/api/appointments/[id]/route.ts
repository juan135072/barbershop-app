import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  barbershopId?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que la cita pertenece a la barbería
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        barbershopId: user.barbershopId,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status },
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Estado de la cita actualizado exitosamente", data: updatedAppointment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar estado de la cita:", error);
    return NextResponse.json(
      { message: "Error al actualizar estado de la cita" },
      { status: 500 }
    );
  }
} 