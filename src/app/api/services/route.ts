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

    const services = await prisma.service.findMany({
      where: {
        barbershopId: user.barbershopId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json(
      { message: "Error al obtener servicios" },
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
    const { name, description, price, duration } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        barbershopId: user.barbershopId,
      },
    });

    return NextResponse.json(
      { message: "Servicio creado exitosamente", data: service },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear servicio:", error);
    return NextResponse.json(
      { message: "Error al crear servicio" },
      { status: 500 }
    );
  }
} 