/*
  Warnings:

  - You are about to drop the column `car_type` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "car_type",
ADD COLUMN     "custom_message" TEXT;
