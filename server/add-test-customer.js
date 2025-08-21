const axios = require('axios');

async function addTestCustomer() {
  try {
    const customerData = {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      birthDate: '1990-05-15',
      passportNo: 'TR123456789',
      passportExpiryDate: '2027-05-15',
      tcIdentity: '12345678901',
      phone: '05551234567',
      email: 'ahmet.yilmaz@email.com',
      countryId: 1, // Almanya
      visaTypeId: 1, // Turistik
      officeId: 1, // İstanbul Merkez
      priorityLevel: 2,
      notes: 'Test müşterisi - Acil işlem gerekli'
    };

    const response = await axios.post('http://localhost:3005/api/customers', customerData);
    console.log('✅ Test müşterisi eklendi:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
  }
}

addTestCustomer();