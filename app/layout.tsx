import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getServerSession } from "next-auth"
import AuthProvider from "@/components/auth-provider"
import { Toaster } from "sonner"
import { Phone, Mail } from 'lucide-react' // UPDATED: Import from lucide-react

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
const session = await getServerSession()

return (
  <html lang="en">
    <head>
      {/* NEW: Google Maps API Script */}
      <script
        async
        defer
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
      ></script>
    </head>
    <body className={inter.className}>
      <AuthProvider session={session}>
        <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/vip4dfw-logo-orange.png" alt="VIP4DFW Logo" width={50} height={50} />
            <span className="text-2xl font-bold text-vipo-DEFAULT hidden md:block">VIP4DFW</span>
          </Link>
          <nav>
            {session?.user ? (
              <div className="flex items-center gap-4">
                <Link href="/about">
                  <Button variant="link" className="text-vipo-DEFAULT hover:underline">About Us</Button>
                </Link>
                <Link href="/policy">
                  <Button variant="link" className="text-vipo-DEFAULT hover:underline">Policy</Button>
                </Link>
                <span className="text-gray-300 hidden sm:block">
                  Hello, {session.user.name || session.user.email}
                </span>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/about">
                  <Button variant="link" className="text-vipo-DEFAULT hover:underline">About Us</Button>
                </Link>
                <Link href="/policy">
                  <Button variant="link" className="text-vipo-DEFAULT hover:underline">Policy</Button>
                </Link>
                {/* <Link href="/login">
                  <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">Login / Sign Up</Button>
                </Link> */}
              </div>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="w-full py-12 md:py-16 bg-gray-900 text-gray-300 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Phone className="w-4 md:w-6 h-6 text-vipo-DEFAULT" />
              <span className="text-sm md:text-lg">Call/Text 24/7: 972 880 8880</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 md:w-6 h-6 text-vipo-DEFAULT" />
              <span className="text-sm md:text-lg">Email: Hello@TurcanPlus.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-lg">📍 Dallas–Fort Worth, Texas</span>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-center items-center gap-2">
            <span>&copy; {new Date().getFullYear()} VIP4DFW. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <Link href="/about" className="hover:underline text-vipo-DEFAULT">About Us</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/policy" className="hover:underline text-vipo-DEFAULT">Policy</Link>
          </div>
        </footer>
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </body>
  </html>
)
}
