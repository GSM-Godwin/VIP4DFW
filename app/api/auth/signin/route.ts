import { NextResponse } from "next/server"
import { signIn } from "next-auth/react"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 })
    }

    // Call the NextAuth.js signIn function directly on the server
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Important: Do not redirect here, handle response manually
    })

    if (result?.error) {
      console.error("API Sign in error:", result.error)
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 })
    }

    // If no error, authentication was successful. NextAuth.js sets the cookies.
    return NextResponse.json({ message: "Signed in successfully!" }, { status: 200 })
  } catch (error: any) {
    console.error("API Sign in error:", error)
    return NextResponse.json(
      { message: `Failed to sign in: ${error.message || "An unknown error occurred."}` },
      { status: 500 },
    )
  }
}
