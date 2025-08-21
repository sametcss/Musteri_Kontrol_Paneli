/*
  Warnings:

  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."customer_additional_services" DROP CONSTRAINT "customer_additional_services_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."customers" DROP CONSTRAINT "customers_country_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."customers" DROP CONSTRAINT "customers_office_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."customers" DROP CONSTRAINT "customers_visa_type_id_fkey";

-- DropTable
DROP TABLE "public"."customers";

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "passportNo" TEXT NOT NULL,
    "passportExpiryDate" TIMESTAMP(3) NOT NULL,
    "tcIdentity" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "priorityLevel" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visaExpiryDate" TIMESTAMP(3),
    "appointmentDate" TIMESTAMP(3),
    "appointmentStatus" TEXT DEFAULT 'pending',
    "documentsComplete" BOOLEAN NOT NULL DEFAULT false,
    "totalCost" DECIMAL(10,2),
    "paidAmount" DECIMAL(10,2),
    "remainingAmount" DECIMAL(10,2),
    "countryId" INTEGER NOT NULL,
    "visaTypeId" INTEGER NOT NULL,
    "officeId" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_passportNo_key" ON "public"."Customer"("passportNo");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tcIdentity_key" ON "public"."Customer"("tcIdentity");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "public"."visa_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "public"."offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_additional_services" ADD CONSTRAINT "customer_additional_services_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
