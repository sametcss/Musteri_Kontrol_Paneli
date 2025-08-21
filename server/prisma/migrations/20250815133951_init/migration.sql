-- CreateTable
CREATE TABLE "public"."CountryVisaType" (
    "countryId" INTEGER NOT NULL,
    "visaTypeId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CountryVisaType_pkey" PRIMARY KEY ("countryId","visaTypeId")
);

-- AddForeignKey
ALTER TABLE "public"."CountryVisaType" ADD CONSTRAINT "CountryVisaType_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountryVisaType" ADD CONSTRAINT "CountryVisaType_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "public"."visa_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
