/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "car_type" TEXT,
ALTER COLUMN "pickup_time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "payment_status" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "public"."drivers" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "password_hash",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."vehicles" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);
