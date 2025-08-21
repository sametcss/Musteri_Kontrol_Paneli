const axios = require('axios');

const testCustomers = [
  {
    firstName: 'Zeynep',
    lastName: 'KAYA',
    birthDate: '1988-03-20',
    passportNo: 'TR987654321',
    passportExpiryDate: '2028-03-20',
    tcIdentity: '98765432109',
    phone: '05551234568',
    email: 'zeynep.kaya@email.com',
    countryId: 2, // Amerika
    visaTypeId: 2, // Ticari
    officeId: 1, // İstanbul
    priorityLevel: 4,
    notes: 'VIP müşteri - Acil işlem'
  },
  {
    firstName: 'Mehmet',
    lastName: 'ÖZ',
    birthDate: '1985-07-10',
    passportNo: 'TR456789123',
    passportExpiryDate: '2026-07-10',
    tcIdentity: '45678912345',
    phone: '05551234569',
    email: 'mehmet.oz@email.com',
    countryId: 4, // Fransa
    visaTypeId: 3, // Eğitim
    officeId: 2, // Ankara
    priorityLevel: 2,
    notes: 'Öğrenci vizesi - Çeviri gerekli'
  },
  {
    firstName: 'Ayşe',
    lastName: 'DEMIR',
    birthDate: '1992-11-05',
    passportNo: 'TR789123456',
    passportExpiryDate: '2029-11-05',
    tcIdentity: '78912345678',
    phone: '05551234570',
    email: 'ayse.demir@email.com',
    countryId: 5, // İtalya
    visaTypeId: 5, // Aile Ziyareti
    officeId: 1, // İstanbul
    priorityLevel: 3,
    notes: 'Aile ziyareti - Davet mektubu var'
  },
  {
    firstName: 'Serkan',
    lastName: 'YURT',
    birthDate: '1980-12-15',
    passportNo: 'TR321654987',
    passportExpiryDate: '2025-12-15',
    tcIdentity: '32165498765',
    phone: '05551234571',
    email: 'serkan.yurt@email.com',
    countryId: 3, // İngiltere
    visaTypeId: 4, // Transit
    officeId: 3, // İzmir
    priorityLevel: 2,
    notes: 'Transit vize - Kısa süreli'
  },
  {
    firstName: 'Elif',
    lastName: 'KAYA',
    birthDate: '1995-04-25',
    passportNo: 'TR654987321',
    passportExpiryDate: '2027-04-25',
    tcIdentity: '65498732165',
    phone: '05551234572',
    email: 'elif.kaya@email.com',
    countryId: 6, // İspanya
    visaTypeId: 1, // Turistik
    officeId: 1, // İstanbul
    priorityLevel: 4,
    notes: 'Grup seyahati - Acil'
  },
  {
    firstName: 'Deniz',
    lastName: 'ÇELİK',
    birthDate: '1987-09-08',
    passportNo: 'TR147258369',
    passportExpiryDate: '2028-09-08',
    tcIdentity: '14725836925',
    phone: '05551234573',
    email: 'deniz.celik@email.com',
    countryId: 1, // Almanya
    visaTypeId: 2, // Ticari
    officeId: 2, // Ankara
    priorityLevel: 5,
    notes: 'Çok acil iş seyahati - VIP'
  },
  {
    firstName: 'Cansu',
    lastName: 'POLAT',
    birthDate: '1993-06-12',
    passportNo: 'TR369258147',
    passportExpiryDate: '2026-06-12',
    tcIdentity: '36925814736',
    phone: '05551234574',
    email: 'cansu.polat@email.com',
    countryId: 4, // Fransa
    visaTypeId: 3, // Eğitim
    officeId: 1, // İstanbul
    priorityLevel: 2,
    notes: 'Erasmus programı'
  },
  {
    firstName: 'Burak',
    lastName: 'ASLAN',
    birthDate: '1982-01-30',
    passportNo: 'TR741852963',
    passportExpiryDate: '2027-01-30',
    tcIdentity: '74185296374',
    phone: '05551234575',
    email: 'burak.aslan@email.com',
    countryId: 2, // Amerika
    visaTypeId: 1, // Turistik
    officeId: 3, // İzmir
    priorityLevel: 3,
    notes: 'Balayı seyahati'
  }
];

async function addMultipleCustomers() {
  console.log('🌱 Test müşterileri ekleniyor...');
  
  for (let i = 0; i < testCustomers.length; i++) {
    try {
      const response = await axios.post('http://localhost:3005/api/customers', testCustomers[i]);
      console.log(`✅ ${i + 1}. müşteri eklendi: ${testCustomers[i].firstName} ${testCustomers[i].lastName}`);
      
      // API'yi fazla yormamak için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ ${testCustomers[i].firstName} ${testCustomers[i].lastName} eklenemedi:`, error.response?.data || error.message);
    }
  }
  
  console.log('🎉 Test müşterileri ekleme tamamlandı!');
}

addMultipleCustomers();