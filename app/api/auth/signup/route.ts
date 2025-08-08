import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma" // Import your Prisma client

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
      },
    })

    return NextResponse.json({ message: "Account created successfully!" }, { status: 201 })
  } catch (error: any) {
    console.error("API Sign up error:", error)
    return NextResponse.json(
      { message: `Failed to create account: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
