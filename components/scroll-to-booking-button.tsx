"use client"

import { Button } from "@/components/ui/button"
import type React from "react"

interface ScrollToBookingButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
}

export function ScrollToBookingButton({ children, className, variant = "default" }: ScrollToBookingButtonProps) {
  const scrollToBookingForm = () => {
    const bookingSection = document.getElementById("booking-form")
    if (bookingSection) {
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <Button onClick={scrollToBookingForm} className={className} variant={variant}>
      {children}
    </Button>
  )
}
