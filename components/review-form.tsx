"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { useActionState } from "react"
import { submitReview } from "@/app/bookings/actions"
import { toast } from "sonner"

interface ReviewFormProps {
  bookingId: string
  onReviewSubmitted: () => void // Callback to re-fetch booking data after submission
}

export function ReviewForm({ bookingId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [reviewMessage, setReviewMessage] = useState("")

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const submittedRating = Number(formData.get("rating"))
      const submittedMessage = formData.get("review-message") as string

      if (submittedRating === 0) {
        return { success: false, message: "Please select a star rating." }
      }

      const result = await submitReview(bookingId, submittedRating, submittedMessage)
      if (result.success) {
        toast.success("Thank you for your review!", {
          description: "Your feedback helps us improve.",
        })
        onReviewSubmitted() // Trigger parent to re-fetch booking data
      } else {
        toast.error("Failed to submit review.", {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  return (
    <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-4">
      <h3 className="text-xl font-bold text-vipo-DEFAULT">Leave a Review</h3>
      <p className="text-gray-300">How was your VIP4DFW experience?</p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              rating >= starValue ? "text-vipo-DEFAULT fill-vipo-DEFAULT" : "text-gray-400"
            }`}
            onClick={() => setRating(starValue)}
          />
        ))}
        <input type="hidden" name="rating" value={rating} form="review-form" /> {/* Hidden input for rating */}
      </div>

      <form id="review-form" action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-message" className="text-gray-300">
            Your Message (Optional)
          </Label>
          <Textarea
            id="review-message"
            name="review-message"
            placeholder="Share your experience..."
            rows={4}
            value={reviewMessage}
            onChange={(e) => setReviewMessage(e.target.value)}
            className="bg-gray-600 border-gray-500 text-white"
          />
        </div>
        {state?.message && (
          <div className={`text-center ${state.success ? "text-green-500" : "text-red-500"}`}>{state.message}</div>
        )}
        <Button
          type="submit"
          className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
          disabled={isPending || rating === 0} // Disable if pending or no rating selected
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  )
}
