// server/seed-data.js
require('dotenv').config();
const prisma = require('./prisma-client');

console.log('DB URL:', process.env.DATABASE_URL);

// ───────────────────────────────────────────────────────────────────────────────
// 1) ÜLKE ↔ VİZE TÜRÜ HARİTASI  (ülkeye göre listelenecek vize türleri)
// ───────────────────────────────────────────────────────────────────────────────
const COUNTRY_VISA_MAP = {
  'Yunanistan': ['Turistik','Ticari','Sağlık','Eğitim','Çalışma'],
  'İtalya': ['Turistik','Ticari','Eğitim','Lojistik','Diğer'],
  'Almanya': ['Kültür','Ticari','Turistik','Ziyaret','Hızlı Vize Prosedürü'],
  'Macaristan': ['Turist','Kültürel','Konferans','Spor','Resmi','Aile ya da arkadaşlar ziyaret','İş','Eğitim','Transit','Sağlık','Diğer'],
  'Slovenya': ['Turist','Kültürel','Konferans','Spor','Resmi','Aile ya da arkadaşlar ziyaret','İş','Eğitim','Transit','Sağlık','Diğer'],
  'Portekiz': ['Turist','Kültürel','Konferans','Spor','Resmi','Aile ya da arkadaşlar ziyaret','İş','Eğitim','Transit','Sağlık','Diğer'],
  'İspanya': ['Turistik','İş','Kültürel','Eğitim','Aile ya da arkadaşlar ziyaret','Çalışma'],
  'Avusturya': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Belçika': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Bulgaristan': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Fransa': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Hollanda': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'İngiltere': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'İsveç': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Malta': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
  'Polonya': ['Turistik','Eğitim','Aile ya da arkadaşlar ziyaret','Ticari'],
};

// ───────────────────────────────────────────────────────────────────────────────
// 2) ÜLKE ↔ OFİS HARİTASI  (ülkeye göre ofis/şube listesi)
//    M:N Country–Office ilişkisini seedler. Aynı isimli ofis birden fazla ülkeye bağlanabilir.
// ───────────────────────────────────────────────────────────────────────────────
const OFFICE_BY_COUNTRY = {
  // YUNANİSTAN
  'Yunanistan': [
    { name: 'İstanbul Astoria (Yunanistan)', address: 'Astoria AVM, Esentepe Mah. Büyükdere Cad No 127 Astoria B1 katı M32 Şişli / İstanbul' },
    { name: 'Trabzon Zorlu (Yunanistan)', address: 'Kahramanmaraş Cd. No: 9 Zorlu Grand Hotel İçi Giriş Katı Ortahisar / Trabzon' },
    { name: 'Bursa Lotus (Yunanistan)', address: 'Konak Mah. 1. Badem Sk. Lotus Plaza No:26 A Blok Kat:1 D:6 Nilüfer/Bursa' },
    { name: 'Çanakkale T.O. (Yunanistan)', address: 'ÇTSO Bursa Yolu 7.Km OSB D:1, 17100 Merkez/Çanakkale' },
  ],
  // İTALYA
  'İtalya': [
    { name: 'İstanbul Avrupa Gayrettepe (İtalya)', address: 'Esentepe Mh. Büyükdere Cd. No:127 Astoria AVM B2 Katı Şişli/İstanbul' },
    { name: 'İstanbul Asya Altunizade (İtalya)', address: 'Altunizade Mah. Kısıklı Cd. Shibuya Sk. Sarkuysan-AK İş Mrk. A Blok No:4/2 BK1 Üsküdar/İstanbul' },
    { name: 'Bursa Lotus (İtalya)', address: 'Konak Mah. 1. Badem Sk., Lotus Plaza, B Blok, No:26 Kat:1 D:10-11-12 Nilüfer/Bursa' },
    { name: 'Trabzon Öztürkler (İtalya)', address: 'İnönü Mah. Yavuz Selim Blv. Öztürkler Apt. No:365A Ortahisar/Trabzon' },
  ],
  // ALMANYA
  'Almanya': [
    { name: 'İstanbul Avrupa Gayrettepe (Almanya)', address: 'Esentepe Mh. Büyükdere Cd. No:127 Astoria AVM B2 Katı Şişli/İstanbul' },
    { name: 'İstanbul Asya Altunizade (Almanya)', address: 'Altunizade Mah. Kısıklı Cd. Shibuya Sk. Sarkuysan-AK İş Mrk. A Blok No:4/2 BK1 Üsküdar/İstanbul' },
    { name: 'Bursa Lotus (Almanya)', address: 'Konak Mah. 1. Badem Sk., Lotus Plaza, B Blok, No:26 Kat:1 D:10-11-12 Nilüfer/Bursa' },
  ],
  // MACARİSTAN
  'Macaristan': [
    { name: 'İstanbul Piyalepaşa (Macaristan)', address: 'Polat Piyalepaşa, İstiklal Mah., Baruthane Deresi Sk. No:2 C-D Blok Beyoğlu/İstanbul' },
  ],
  // SLOVENYA
  'Slovenya': [
    { name: 'İstanbul Piyalepaşa (Slovenya)', address: 'Polat Piyalepaşa, İstiklal Mah., Baruthane Deresi Sk. No:2 C-D Blok Beyoğlu/İstanbul' },
  ],
  // PORTEKİZ
  'Portekiz': [
    { name: 'İstanbul Piyalepaşa (Portekiz)', address: 'Polat Piyalepaşa, İstiklal Mah., Baruthane Deresi Sk. No:2 C-D Blok Beyoğlu/İstanbul' },
  ],
  // İSPANYA
  'İspanya': [
    { name: 'İstanbul Yeşilce (İspanya)', address: 'Yeşilce Mah., Diken Sk. No:2, 34418 Kağıthane/İstanbul' },
    { name: 'İzmir Aksoy (İspanya)', address: 'Kıbrıs Şehitleri Cad. Aksoy İş Mrk. No:152 Zemin Z06-Z07-Z08-Z15 Konak/İzmir' },
    { name: 'Antalya Çağlayan (İspanya)', address: 'Çağlayan, 2053. Sk. No:28, 07230 Muratpaşa/Antalya' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────────
// Seed helpers
// ───────────────────────────────────────────────────────────────────────────────
async function seedCountries() {
  const countries = [
    { name: 'Yunanistan', code: 'GRC' },
    { name: 'İtalya', code: 'ITA' },
    { name: 'Almanya', code: 'GER' },
    { name: 'Macaristan', code: 'HUN' },
    { name: 'Slovenya', code: 'SVN' },
    { name: 'Portekiz', code: 'PRT' },
    { name: 'İspanya', code: 'ESP' },
    { name: 'Bulgaristan', code: 'BGR' },
    { name: 'Fransa', code: 'FRA' },
    { name: 'Hollanda', code: 'NLD' },
    { name: 'İsveç', code: 'SWE' },
    { name: 'Avusturya', code: 'AUT' },
    { name: 'Belçika', code: 'BEL' },
    { name: 'Polonya', code: 'POL' },
    { name: 'Malta', code: 'MLT' },
    { name: 'İngiltere', code: 'GBR' },
  ];

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.name, isActive: true },
      create: { name: c.name, code: c.code, isActive: true },
    });
    console.log(`✓ ${c.name} (${c.code}) hazır`);
  }
}

async function seedVisaTypes() {
  // COUNTRY_VISA_MAP içinden tüm benzersiz vize türleri
  const uniqTypes = [...new Set(Object.values(COUNTRY_VISA_MAP).flat())];

  for (const name of uniqTypes) {
    const existing = await prisma.visaType.findFirst({ where: { name } });
    if (existing) {
      await prisma.visaType.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    } else {
      await prisma.visaType.create({
        data: { name, isActive: true },
      });
    }
  }
}

async function seedOfficesByCountry() {
  for (const [countryName, officeList] of Object.entries(OFFICE_BY_COUNTRY)) {
    const country = await prisma.country.findFirst({ where: { name: countryName } });
    if (!country) {
      console.warn('Ülke bulunamadı, atlanıyor:', countryName);
      continue;
    }

    for (const o of officeList) {
      // Office.name unique olmayabilir → güvenli create/update
      const existing = await prisma.office.findFirst({ where: { name: o.name } });
      let office;
      if (existing) {
        office = await prisma.office.update({
          where: { id: existing.id },
          data: { address: o.address, isActive: true },
        });
      } else {
        office = await prisma.office.create({
          data: { name: o.name, address: o.address, isActive: true },
        });
      }

      // Ülkeye bağla (M:N)
      await prisma.office.update({
        where: { id: office.id },
        data: { countries: { connect: { id: country.id } } },
      });
    }
    console.log(`✓ ${countryName} için ofisler eklendi (${officeList.length})`);
  }
}

async function seedCountryVisaTypes() {
  const byName = (model, name) => prisma[model].findFirst({ where: { name } });

  for (const [countryName, types] of Object.entries(COUNTRY_VISA_MAP)) {
    const country = await byName('country', countryName);
    if (!country) { console.warn('Ülke yok:', countryName); continue; }

    for (const vtName of types) {
      const vt = await byName('visaType', vtName);
      if (!vt) { console.warn('Vize türü yok:', vtName); continue; }

      // countryId + visaTypeId bileşimi unique olmalı (schema’da @@unique tanımlı)
      await prisma.countryVisaType.upsert({
        where: { countryId_visaTypeId: { countryId: country.id, visaTypeId: vt.id } },
        update: { isActive: true },
        create: { countryId: country.id, visaTypeId: vt.id, isActive: true },
      });
    }
    console.log(`✓ ${countryName} eşleşmeleri tamam`);
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seed başlıyor');
  await seedCountries();
  await seedVisaTypes();
  await seedOfficesByCountry();
  await seedCountryVisaTypes();
  console.log('✅ Seed bitti');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
