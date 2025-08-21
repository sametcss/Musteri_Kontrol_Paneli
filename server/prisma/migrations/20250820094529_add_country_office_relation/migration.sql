-- CreateTable
CREATE TABLE "public"."_CountryToOffice" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CountryToOffice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CountryToOffice_B_index" ON "public"."_CountryToOffice"("B");

-- AddForeignKey
ALTER TABLE "public"."_CountryToOffice" ADD CONSTRAINT "_CountryToOffice_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CountryToOffice" ADD CONSTRAINT "_CountryToOffice_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."offices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
