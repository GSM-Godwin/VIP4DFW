-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "tip_amount" DECIMAL(10,2),
ADD COLUMN     "tip_paid_at" TIMESTAMPTZ(6),
ADD COLUMN     "tip_payment_intent_id" TEXT,
ADD COLUMN     "tip_status" TEXT DEFAULT 'none';
