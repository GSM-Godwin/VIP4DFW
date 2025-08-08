"use server"

// Only signOut and auth (for getUser) remain as server-side functions.
// signIn and signUp logic is now handled by client-side components and API routes.
import { signOut, auth } from "next-auth" // Import signOut and auth from "next-auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma" // Import your Prisma client

// Removed signUp and signInUser functions from here.
// Their logic is now in components/auth-form.tsx and app/api/auth/signup/route.ts

export async function signOutUser() {
  await signOut({ redirect: false, redirectTo: "/login" }) // Sign out and redirect to login
  redirect("/login")
}

// Helper to get the current authenticated user with their profile name
export async function getUser() {
  const session = await auth() // Use the auth helper directly from "next-auth"
  if (session?.user?.id) {
    // Fetch full user data from Prisma if needed, including name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true }, // Select only necessary fields
    })
    return user
  }
  return null
}
