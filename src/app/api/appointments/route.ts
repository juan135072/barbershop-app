import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  barbershopId?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        barbershopId: user.barbershopId,
      },
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
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json(
      { message: "Error al obtener citas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.barbershopId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      date,
      startTime,
      endTime,
      clientName,
      clientPhone,
      clientEmail,
      notes,
      barberId,
      serviceId,
    } = body;

    // Verificar disponibilidad
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
        status: {
          notIn: ["CANCELLED"],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { message: "El horario seleccionado no está disponible" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        clientName,
        clientPhone,
        clientEmail,
        notes,
        barbershopId: user.barbershopId,
        barberId,
        serviceId,
      },
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
      { message: "Cita creada exitosamente", data: appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear cita:", error);
    return NextResponse.json(
      { message: "Error al crear cita" },
      { status: 500 }
    );
  }
} 