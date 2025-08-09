/*
  Warnings:

  - A unique constraint covering the columns `[checkout_session_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "checkout_session_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_checkout_session_id_key" ON "public"."bookings"("checkout_session_id");
