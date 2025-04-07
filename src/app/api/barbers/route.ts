import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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

    const barbers = await prisma.barber.findMany({
      where: {
        barbershopId: user.barbershopId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    return NextResponse.json(barbers);
  } catch (error) {
    console.error("Error al obtener barberos:", error);
    return NextResponse.json(
      { message: "Error al obtener barberos" },
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
    const { name, email, password, specialties, commission } = body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Crear usuario y barbero en una transacción
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password, // La contraseña debe estar hasheada antes de llegar aquí
          role: "BARBER",
          barbershopId: user.barbershopId!,
        },
      });

      // Crear barbero
      const barber = await tx.barber.create({
        data: {
          userId: newUser.id,
          barbershopId: user.barbershopId!,
          specialties,
          commission: parseFloat(commission),
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return barber;
    });

    return NextResponse.json(
      { message: "Barbero creado exitosamente", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear barbero:", error);
    return NextResponse.json(
      { message: "Error al crear barbero" },
      { status: 500 }
    );
  }
} 