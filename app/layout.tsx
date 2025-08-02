import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser, signOut } from "@/app/auth/actions"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VIP4DFW - Luxury Car Service",
  description: "Your VIP Ride to DFW & Dallas Love Field Starts Here",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/vip4dfw-logo-orange.png" alt="VIP4DFW Logo" width={50} height={50} />
            <span className="text-2xl font-bold text-vipo-DEFAULT hidden md:block">VIP4DFW</span>
          </Link>
          <nav>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 hidden sm:block">Hello, {user.name || user.email}</span>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button type="submit" className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">Login / Sign Up</Button>
              </Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
