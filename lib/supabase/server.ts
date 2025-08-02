import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  const cookieStore = cookies() // Call cookies() here. It returns a ReadonlyRequestCookies object.

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      async get(name: string) {
        // Make this method async and await cookieStore
        return (await cookieStore).get(name)?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        // Make this method async and await cookieStore
        try {
          ;(await cookieStore).set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called from a Server Component or Server Action.
          // This error is typically caused by an attempt to set a cookie from a Client Component.
          // If you're using a Client Component, you can still set cookies using the Next.js API route
          // or by wrapping your cookie setting logic in a Server Action.
          console.warn("Attempted to set cookie from unsupported context:", error)
        }
      },
      async remove(name: string, options: CookieOptions) {
        // Make this method async and await cookieStore
        try {
          ;(await cookieStore).set({ name, value: "", ...options })
        } catch (error) {
          console.warn("Attempted to remove cookie from unsupported context:", error)
        }
      },
    },
  })
}
