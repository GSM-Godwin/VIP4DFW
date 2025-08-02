"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signUp(formData: FormData) {
  const origin = (await headers()).get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string // UNCOMMENT THIS LINE
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { name: name }, // UNCOMMENT AND ENSURE THIS LINE IS PRESENT
    },
  })

  if (error) {
    console.error("Sign up error:", error.message)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Check your email to confirm your account." }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    return { success: false, message: error.message }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error.message)
  }

  redirect("/login")
}

export async function sendPasswordResetEmail(formData: FormData) {
  const origin = (await headers()).get("origin")
  const email = formData.get("email") as string
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    console.error("Password reset email error:", error.message)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Check your email for the password reset link." }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    console.error("Update password error:", error.message)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Your password has been updated successfully. You can now log in." }
}

// Helper to get the current authenticated user with their profile name
export async function getUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Fetch profile data from the 'profiles' table
    const { data: profile, error } = await supabase.from("profiles").select("name").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching profile:", error.message)
      // Return user without name if profile fetch fails
      return { ...user, name: null }
    }
    return { ...user, name: profile?.name || null }
  }
  return null
}
