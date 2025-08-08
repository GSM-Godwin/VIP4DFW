"use server"

import { signOut, auth } from "next-auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma" 

export async function signOutUser() {
  await signOut({ redirect: false, redirectTo: "/login" })
  redirect("/login")
}

export async function getUser() {
  const session = await auth()
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    })
    return user
  }
  return null
}
