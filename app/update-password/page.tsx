"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePassword } from "@/app/auth/actions"

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Supabase automatically handles the session for password reset links
  // by setting cookies when the user lands on this page.
  // We just need to ensure the user is authenticated before allowing password update.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setMessageType(null)

    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setMessageType("error")
      setIsLoading(false)
      return
    }

    const result = await updatePassword(formData)

    if (result.success) {
      setMessage(result.message)
      setMessageType("success")
      // Redirect to login after a short delay to allow user to read message
      setTimeout(() => {
        router.push("/login")
      }, 3000)
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
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Set New Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-300 text-center">Enter your new password below.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-300">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirm-password"
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
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
          {message && (
            <div className={`mt-4 text-center ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
