-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "review_message" TEXT,
ADD COLUMN     "review_rating" INTEGER;
