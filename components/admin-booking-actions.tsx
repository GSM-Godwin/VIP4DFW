"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { updateBookingStatus } from "@/app/bookings/actions"
import { toast } from "sonner" // NEW: Import toast from sonner

interface AdminBookingActionsProps {
  bookingId: string;
  currentStatus: string;
}

export function AdminBookingActions({ bookingId, currentStatus }: AdminBookingActionsProps) {
  // Action for confirming a booking
  const [confirmState, confirmAction, isConfirmPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateBookingStatus(bookingId, 'confirmed');
      if (result.success) {
        toast.success(`Booking ${bookingId} has been confirmed.`, {
          description: "Email notification sent to the client.",
        });
      } else {
        toast.error(`Failed to confirm booking ${bookingId}.`, {
          description: result.message,
        });
      }
      return result;
    },
    { success: false, message: "" }
  );

  // Action for declining a booking
  const [declineState, declineAction, isDeclinePending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateBookingStatus(bookingId, 'declined');
      if (result.success) {
        toast.info(`Booking ${bookingId} has been declined.`, {
          description: "Email notification sent to the client.",
        });
      } else {
        toast.error(`Failed to decline booking ${bookingId}.`, {
          description: result.message,
        });
      }
      return result;
    },
    { success: false, message: "" }
  );

  return (
    <div className="flex gap-2 mt-4 md:mt-0">
      {currentStatus === 'pending' && (
        <>
          <form action={confirmAction}>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isConfirmPending || isDeclinePending}>
              {isConfirmPending ? "Confirming..." : "Accept"}
            </Button>
          </form>
          <form action={declineAction}>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isConfirmPending || isDeclinePending}>
              {isDeclinePending ? "Declining..." : "Decline"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
