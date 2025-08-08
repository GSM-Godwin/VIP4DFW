"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react" // Import signIn from next-auth/react for client-side use

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setMessageType(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string // Only for signup

    let result

    if (isLogin) {
      // Call client-side signIn function
      result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important: Handle redirect manually
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
        setMessage("Invalid credentials.")
        setMessageType("error")
      } else {
        setMessage("Signed in successfully! Redirecting...")
        setMessageType("success")
        router.push("/dashboard") // Redirect on successful login
      }
    } else {
      // For signup, we'll still use a server action to create the user securely
      // and then use client-side signIn to log them in.
      try {
        const response = await fetch("/api/auth/signup", { // Use the dedicated signup API route
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json()

        if (response.ok) {
          setMessage(data.message)
          setMessageType("success")
          // After successful signup, automatically sign in the user
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          })

          if (signInResult?.error) {
            setMessage(`Signup successful, but failed to auto-login: ${signInResult.error}`)
            setMessageType("error")
          } else {
            setMessage("Account created and signed in successfully! Redirecting...")
            setMessageType("success")
            router.push("/dashboard")
          }
        } else {
          setMessage(data.message || "An unknown error occurred during signup.")
          setMessageType("error")
        }
      } catch (error: any) {
        console.error("Signup fetch error:", error)
        setMessage(`Network error during signup: ${error.message || "Could not connect to server."}`)
        setMessageType("error")
      }
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">{isLogin ? "Login" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (isLogin ? "Logging In..." : "Signing Up...") : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
        {message && (
          <div className={`mt-4 text-center ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
            {message}
          </div>
        )}
        <div className="text-center text-sm text-gray-400">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Button variant="link" onClick={() => setIsLogin(false)} className="text-vipo-DEFAULT p-0 h-auto">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button variant="link" onClick={() => setIsLogin(true)} className="text-vipo-DEFAULT p-0 h-auto">
                Login
              </Button>
            </>
          )}
        </div>
        {isLogin && (
          <div className="text-center text-sm">
            {/* NextAuth.js handles password resets differently, typically via email links.
                We'll remove this for now and can re-implement a proper flow later if needed. */}
            {/* <Link href="/forgot-password" className="text-vipo-DEFAULT hover:underline">
              Forgot your password?
            </Link> */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
