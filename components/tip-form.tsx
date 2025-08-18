"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Heart, Star } from "lucide-react"
import { useActionState } from "react"
import { createTipPaymentIntent, confirmTipPayment, cancelTipPayment } from "@/app/bookings/actions"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface TipFormProps {
  bookingId: string
  driverName?: string
  currentTipAmount?: number | null
  currentTipStatus?: string | null
  onTipCompleted: () => void
}

// Predefined tip amounts
const QUICK_TIP_AMOUNTS = [5, 10, 15, 20, 25]

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#374151",
      "::placeholder": {
        color: "#9CA3AF",
      },
    },
    invalid: {
      color: "#EF4444",
    },
  },
}

function TipPaymentForm({
  bookingId,
  tipAmount,
  clientSecret,
  onSuccess,
  onCancel,
}: {
  bookingId: string
  tipAmount: number
  clientSecret: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("Card element not found")
      setIsProcessing(false)
      return
    }

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        console.error("Payment failed:", error)
        toast.error(`Payment failed: ${error.message}`)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on the server
        const result = await confirmTipPayment(bookingId, paymentIntent.id)
        if (result.success) {
          toast.success("Thank you for your tip!", {
            description: "Your tip has been processed successfully.",
          })
          onSuccess()
        } else {
          toast.error("Failed to confirm tip payment", {
            description: result.message,
          })
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error("Payment processing error", {
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="text-vipo-DEFAULT flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Complete Your ${tipAmount.toFixed(2)} Tip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Card Information</Label>
            <div className="p-3 bg-gray-600 border border-gray-500 rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold"
            >
              {isProcessing ? "Processing..." : `Pay $${tipAmount.toFixed(2)} Tip`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="border-gray-500 text-gray-300 hover:bg-gray-600 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-400 text-center">
          Your payment is secured by Stripe. We never store your card information.
        </p>
      </CardContent>
    </Card>
  )
}

function TipFormContent({ bookingId, driverName, currentTipAmount, currentTipStatus, onTipCompleted }: TipFormProps) {
  const [customTipAmount, setCustomTipAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const [createTipState, createTipAction, isCreatingTip] = useActionState(
    async (prevState: any, formData: FormData) => {
      const amount = selectedAmount || Number.parseFloat(customTipAmount)

      if (!amount || amount <= 0) {
        return { success: false, message: "Please select or enter a valid tip amount." }
      }

      const result = await createTipPaymentIntent(bookingId, amount)
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
        setShowPaymentForm(true)
        toast.success("Tip payment ready!", {
          description: "Please enter your card details to complete the tip.",
        })
      } else {
        toast.error("Failed to create tip payment", {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  const handleQuickTipSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomTipAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTipAmount(e.target.value)
    setSelectedAmount(null)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    setSelectedAmount(null)
    setCustomTipAmount("")
    onTipCompleted()
  }

  const handlePaymentCancel = async () => {
    // Cancel the tip payment intent
    await cancelTipPayment(bookingId)
    setShowPaymentForm(false)
    setClientSecret(null)
    toast.info("Tip payment cancelled")
  }

  // Show payment form if we have a client secret
  if (showPaymentForm && clientSecret) {
    return (
      <TipPaymentForm
        bookingId={bookingId}
        tipAmount={selectedAmount || Number.parseFloat(customTipAmount)}
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    )
  }

  // Show tip already paid message
  if (currentTipStatus === "paid" && currentTipAmount) {
    return (
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-green-500 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Thank You for Your Tip!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-3xl font-bold text-vipo-DEFAULT">${currentTipAmount.toFixed(2)}</div>
          <p className="text-gray-300">
            Your generous tip has been processed successfully.
            {driverName && ` ${driverName} really appreciates your kindness!`}
          </p>
          <div className="flex justify-center">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-vipo-DEFAULT fill-vipo-DEFAULT" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show tip selection form
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="text-vipo-DEFAULT flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Add a Tip {driverName && `for ${driverName}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-300 text-center">
          Show your appreciation for excellent service! Tips go directly to your driver.
        </p>

        <form action={createTipAction} className="space-y-4">
          {/* Quick tip buttons */}
          <div className="space-y-2">
            <Label className="text-gray-300">Quick Tip Amounts</Label>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_TIP_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={`${
                    selectedAmount === amount
                      ? "bg-vipo-DEFAULT text-black"
                      : "border-gray-500 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => handleQuickTipSelect(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount input */}
          <div className="space-y-2">
            <Label htmlFor="custom-tip" className="text-gray-300">
              Or Enter Custom Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="custom-tip"
                type="number"
                min="0.01"
                max="1000"
                step="0.01"
                placeholder="0.00"
                value={customTipAmount}
                onChange={handleCustomAmountChange}
                className="pl-10 bg-gray-600 border-gray-500 text-white"
              />
            </div>
          </div>

          {/* Selected amount display */}
          {(selectedAmount || Number.parseFloat(customTipAmount) > 0) && (
            <div className="text-center p-4 bg-gray-600 rounded-lg">
              <p className="text-gray-300">Tip Amount:</p>
              <p className="text-2xl font-bold text-vipo-DEFAULT">
                ${(selectedAmount || Number.parseFloat(customTipAmount)).toFixed(2)}
              </p>
            </div>
          )}

          {createTipState?.message && (
            <div className={`text-center ${createTipState.success ? "text-green-500" : "text-red-500"}`}>
              {createTipState.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
            disabled={isCreatingTip || (!selectedAmount && !Number.parseFloat(customTipAmount))}
          >
            {isCreatingTip ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          Tips are processed securely through Stripe. Your driver will be notified of your generosity.
        </p>
      </CardContent>
    </Card>
  )
}

export function TipForm(props: TipFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <TipFormContent {...props} />
    </Elements>
  )
}
