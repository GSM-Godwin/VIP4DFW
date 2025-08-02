"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, signUp } from "@/app/auth/actions"
import Link from "next/link"

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
    let result

    if (isLogin) {
      result = await signIn(formData)
    } else {
      result = await signUp(formData)
    }

    if (result.success) {
      setMessage(result.message)
      setMessageType("success")
      if (isLogin) {
        router.push("/dashboard") // Redirect on successful login
      }
    } else {
      setMessage(result.message)
      setMessageType("error")
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
            <Link href="/forgot-password" className="text-vipo-DEFAULT hover:underline">
              Forgot your password?
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
