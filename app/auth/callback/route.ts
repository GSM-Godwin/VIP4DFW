import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const cookieStore = cookies() // This is fine here, as it's a direct call in a Server Action
    const supabase = await createSupabaseServerClient() // Await the client creation

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
}
