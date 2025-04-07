import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, barbershop } = body;

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

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y barbería en una transacción
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Crear barbería
      const newBarbershop = await tx.barbershop.create({
        data: {
          name: barbershop.name,
          address: barbershop.address,
          phone: barbershop.phone,
          email: email,
          openingTime: barbershop.openingTime,
          closingTime: barbershop.closingTime,
        },
      });

      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
          barbershopId: newBarbershop.id,
        },
      });

      return { user: newUser, barbershop: newBarbershop };
    });

    return NextResponse.json(
      { message: "Registro exitoso", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      { message: "Error al registrar" },
      { status: 500 }
    );
  }
} 