"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendPasswordResetEmail } from "@/app/auth/actions"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setMessageType(null)

    const formData = new FormData(event.currentTarget)
    const result = await sendPasswordResetEmail(formData)

    if (result.success) {
      setMessage(result.message)
      setMessageType("success")
    } else {
      setMessage(result.message)
      setMessageType("error")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-300 text-center">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button
              type="submit"
              className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </form>
          {message && (
            <div className={`mt-4 text-center ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
              {message}
            </div>
          )}
          <div className="text-center text-sm">
            <Link href="/login" className="text-vipo-DEFAULT hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
