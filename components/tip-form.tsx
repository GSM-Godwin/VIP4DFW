"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Heart, Star, CreditCard } from "lucide-react"
import { useActionState } from "react"
import { createTipPaymentIntent, confirmTipPayment, cancelTipPayment } from "@/app/bookings/actions"
import { toast } from "sonner"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  bookingId: string
  rideCost: number
  driverName?: string
  currentTipAmount?: number | null
  currentTipStatus?: string | null
  currentPaymentStatus?: string | null
  onPaymentCompleted: () => void // Callback to refresh booking data
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

function PaymentProcessingForm({
  bookingId,
  rideCost,
  tipAmount,
  totalAmount,
  clientSecret,
  onSuccess,
  onCancel,
}: {
  bookingId: string
  rideCost: number
  tipAmount: number
  totalAmount: number
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
          toast.success("Payment successful!", {
            description:
              tipAmount > 0
                ? `Your ride payment and tip have been processed successfully.`
                : `Your ride payment has been processed successfully.`,
          })
          onSuccess()
        } else {
          toast.error("Failed to confirm payment", {
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
          <CreditCard className="w-5 h-5" />
          Complete Your Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="p-4 bg-gray-600 rounded-lg border border-gray-500">
          <h4 className="font-semibold text-gray-200 mb-2">Payment Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Ride Cost:</span>
              <span className="text-white">${rideCost.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Tip:</span>
                <span className="text-white">${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-500 pt-1 flex justify-between font-semibold">
              <span className="text-gray-200">Total:</span>
              <span className="text-vipo-DEFAULT">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

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
              {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
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

function PaymentFormContent({
  bookingId,
  rideCost,
  driverName,
  currentTipAmount,
  currentTipStatus,
  currentPaymentStatus,
  onPaymentCompleted,
}: PaymentFormProps) {
  const [customTipAmount, setCustomTipAmount] = useState("")
  const [selectedTipAmount, setSelectedTipAmount] = useState<number | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Check if ride payment is already completed
  const isRidePaid = currentPaymentStatus === "paid"
  const isTipPaid = currentTipStatus === "paid"
  const bothPaid = isRidePaid && isTipPaid

  const [createPaymentState, createPaymentAction, isCreatingPayment] = useActionState(
    async (prevState: any, formData: FormData) => {
      const tipAmount = selectedTipAmount || Number.parseFloat(customTipAmount) || 0
      const totalAmount = rideCost + tipAmount

      if (totalAmount <= 0) {
        return { success: false, message: "Invalid payment amount." }
      }

      const result = await createTipPaymentIntent(bookingId, totalAmount)
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
        setShowPaymentForm(true)
        toast.success("Payment ready!", {
          description: "Please enter your card details to complete your payment.",
        })
      } else {
        toast.error("Failed to create payment", {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  const handleQuickTipSelect = (amount: number) => {
    setSelectedTipAmount(amount)
    setCustomTipAmount("")
  }

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTipAmount(e.target.value)
    setSelectedTipAmount(null)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setClientSecret(null)
    setSelectedTipAmount(null)
    setCustomTipAmount("")
    onPaymentCompleted()
  }

  const handlePaymentCancel = async () => {
    // Cancel the payment intent
    await cancelTipPayment(bookingId)
    setShowPaymentForm(false)
    setClientSecret(null)
    toast.info("Payment cancelled")
  }

  const getTipAmount = () => selectedTipAmount || Number.parseFloat(customTipAmount) || 0
  const getTotalAmount = () => rideCost + getTipAmount()

  // Show payment form if we have a client secret
  if (showPaymentForm && clientSecret) {
    return (
      <PaymentProcessingForm
        bookingId={bookingId}
        rideCost={rideCost}
        tipAmount={getTipAmount()}
        totalAmount={getTotalAmount()}
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    )
  }

  // Show completion message if everything is paid
  if (bothPaid) {
    return (
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-green-500 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-200">Ride Cost: ${rideCost.toFixed(2)}</div>
            {currentTipAmount && currentTipAmount > 0 && (
              <div className="text-lg font-semibold text-vipo-DEFAULT">Tip: ${currentTipAmount.toFixed(2)}</div>
            )}
            <div className="text-2xl font-bold text-green-500">
              Total Paid: ${(rideCost + (currentTipAmount || 0)).toFixed(2)}
            </div>
          </div>
          <p className="text-gray-300">
            Thank you for your payment!
            {driverName &&
              currentTipAmount &&
              currentTipAmount > 0 &&
              ` ${driverName} really appreciates your generous tip!`}
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

  // Show payment selection form
  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="text-vipo-DEFAULT flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Your Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-gray-600 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-200 mb-2">Ride Cost</h4>
          <div className="text-3xl font-bold text-vipo-DEFAULT">${rideCost.toFixed(2)}</div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-200 flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5" />
              Add a Tip {driverName && `for ${driverName}`} (Optional)
            </h4>
            <p className="text-gray-300 text-sm">
              Show your appreciation for excellent service! Tips go directly to your driver.
            </p>
          </div>

          <form action={createPaymentAction} className="space-y-4">
            {/* Quick tip buttons */}
            <div className="space-y-2">
              <Label className="text-gray-300">Quick Tip Amounts</Label>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_TIP_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={selectedTipAmount === amount ? "default" : "outline"}
                    className={`${
                      selectedTipAmount === amount
                        ? "bg-vipo-DEFAULT text-black"
                        : "border-gray-500 text-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleQuickTipSelect(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom tip input */}
            <div className="space-y-2">
              <Label htmlFor="custom-tip" className="text-gray-300">
                Or Enter Custom Tip Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="custom-tip"
                  type="number"
                  min="0"
                  max="1000"
                  step="5.00"
                  placeholder="0.00"
                  value={customTipAmount}
                  onChange={handleCustomTipChange}
                  className="pl-10 bg-gray-600 border-gray-500 text-white"
                />
              </div>
            </div>

            {/* No tip option */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-600 bg-transparent"
                onClick={() => {
                  setSelectedTipAmount(null)
                  setCustomTipAmount("")
                }}
                disabled={!selectedTipAmount && !Number.parseFloat(customTipAmount)}
              >
                No Tip - Just Pay Ride Cost
              </Button>
            </div>

            {/* Payment summary */}
            <div className="text-center p-4 bg-gray-600 rounded-lg">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Ride Cost:</span>
                  <span>${rideCost.toFixed(2)}</span>
                </div>
                {getTipAmount() > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tip:</span>
                    <span>${getTipAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-500 pt-2 flex justify-between font-bold">
                  <span className="text-gray-200">Total:</span>
                  <span className="text-2xl text-vipo-DEFAULT">${getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {createPaymentState?.message && (
              <div className={`text-center ${createPaymentState.success ? "text-green-500" : "text-red-500"}`}>
                {createPaymentState.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
              disabled={isCreatingPayment}
            >
              {isCreatingPayment ? "Processing..." : `Pay $${getTotalAmount().toFixed(2)}`}
            </Button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Payments are processed securely through Stripe. We never store your card information.
        </p>
      </CardContent>
    </Card>
  )
}

export function TipForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}
