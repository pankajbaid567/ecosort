-- CreateEnum
CREATE TYPE "WasteCategory" AS ENUM ('WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE');

-- CreateEnum
CREATE TYPE "BinType" AS ENUM ('WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WasteCategory" NOT NULL,
    "disposalInstructions" TEXT NOT NULL,
    "binType" "BinType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" "BinType" NOT NULL,
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wasteItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 1,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waste_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "waste_items_name_key" ON "waste_items"("name");

-- AddForeignKey
ALTER TABLE "waste_logs" ADD CONSTRAINT "waste_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_logs" ADD CONSTRAINT "waste_logs_wasteItemId_fkey" FOREIGN KEY ("wasteItemId") REFERENCES "waste_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
