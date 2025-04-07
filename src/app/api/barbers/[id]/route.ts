import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  barbershopId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const barber = await prisma.barber.findFirst({
      where: {
        id: params.id,
        barbershopId: user.barbershopId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!barber) {
      return NextResponse.json(
        { message: "Barbero no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(barber);
  } catch (error) {
    console.error("Error al obtener barbero:", error);
    return NextResponse.json(
      { message: "Error al obtener barbero" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el barbero pertenece a la barbería
    const barber = await prisma.barber.findFirst({
      where: {
        id: params.id,
        barbershopId: user.barbershopId,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { message: "Barbero no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el barbero y su usuario asociado en una transacción
    await prisma.$transaction(async (tx: PrismaClient) => {
      await tx.barber.delete({
        where: { id: params.id },
      });

      await tx.user.delete({
        where: { id: barber.userId },
      });
    });

    return NextResponse.json(
      { message: "Barbero eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar barbero:", error);
    return NextResponse.json(
      { message: "Error al eliminar barbero" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el barbero pertenece a la barbería
    const barber = await prisma.barber.findFirst({
      where: {
        id: params.id,
        barbershopId: user.barbershopId,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { message: "Barbero no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, specialties, commission } = body;

    // Actualizar el barbero y su usuario asociado en una transacción
    const updatedBarber = await prisma.$transaction(async (tx: PrismaClient) => {
      // Actualizar usuario
      await tx.user.update({
        where: { id: barber.userId },
        data: { name },
      });

      // Actualizar barbero
      return await tx.barber.update({
        where: { id: params.id },
        data: {
          specialties,
          commission,
        },
      });
    });

    return NextResponse.json(
      { message: "Barbero actualizado exitosamente", data: updatedBarber },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar barbero:", error);
    return NextResponse.json(
      { message: "Error al actualizar barbero" },
      { status: 500 }
    );
  }
} 