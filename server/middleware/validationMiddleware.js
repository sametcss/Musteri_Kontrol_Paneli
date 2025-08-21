// server/middleware/validationMiddleware.js

const validateCustomer = (req, res, next) => {
  const {
    firstName,
    lastName,
    birthDate,
    passportNo,
    passportExpiryDate,
    tcIdentity,
    phone,
    email,
    countryId,
    visaTypeId,
    officeId,
    priorityLevel
  } = req.body;

  console.log('🔍 Validating customer data:', {
    firstName,
    lastName,
    passportNo,
    tcIdentity,
    phone,
    countryId,
    visaTypeId,
    officeId
  });

  const errors = [];

  // Required fields validation
  const requiredFields = {
    firstName: 'Ad',
    lastName: 'Soyad',
    birthDate: 'Doğum Tarihi',
    passportNo: 'Pasaport No',
    passportExpiryDate: 'Pasaport Geçerlilik Tarihi',
    tcIdentity: 'TC Kimlik No',
    phone: 'Telefon',
    countryId: 'Ülke',
    visaTypeId: 'Vize Türü',
    officeId: 'Ofis'
  };

  // Check required fields
  Object.keys(requiredFields).forEach(field => {
    if (!req.body[field] || req.body[field] === '') {
      errors.push(`${requiredFields[field]} alanı zorunludur`);
    }
  });

  // TC Identity validation (11 digits) - BASITLEŞTIRILDI
  if (tcIdentity && !/^\d{11}$/.test(tcIdentity)) {
    errors.push('TC Kimlik No 11 haneli sayı olmalıdır');
  }

  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Geçerli bir e-posta adresi girin');
  }

  // Name validation (Turkish characters allowed) - GEVŞETILDI
  if (firstName && firstName.trim().length < 2) {
    errors.push('Ad en az 2 karakter olmalıdır');
  }

  if (lastName && lastName.trim().length < 2) {
    errors.push('Soyad en az 2 karakter olmalıdır');
  }

  // Passport format validation - GEVŞETILDI
  if (passportNo && passportNo.length < 6) {
    errors.push('Pasaport No en az 6 karakter olmalıdır');
  }

  // Date validations - BASITLEŞTIRILDI
  if (birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    
    if (birth >= today) {
      errors.push('Doğum tarihi bugünden önce olmalıdır');
    }
    
    if (age < 0 || age > 150) {
      errors.push('Geçerli bir doğum tarihi girin');
    }
  }

  if (passportExpiryDate) {
    const expiry = new Date(passportExpiryDate);
    const today = new Date();
    
    if (expiry <= today) {
      errors.push('Pasaport geçerlilik tarihi bugünden sonra olmalıdır');
    }
  }

  // ID validations
  if (countryId && (!Number.isInteger(Number(countryId)) || Number(countryId) <= 0)) {
    errors.push('Geçerli bir ülke seçin');
  }

  if (visaTypeId && (!Number.isInteger(Number(visaTypeId)) || Number(visaTypeId) <= 0)) {
    errors.push('Geçerli bir vize türü seçin');
  }

  if (officeId && (!Number.isInteger(Number(officeId)) || Number(officeId) <= 0)) {
    errors.push('Geçerli bir ofis seçin');
  }

  // Priority level validation
  if (priorityLevel && (priorityLevel < 1 || priorityLevel > 5)) {
    errors.push('Öncelik seviyesi 1-5 arasında olmalıdır');
  }

  // Cost validations
  if (req.body.totalCost !== undefined && req.body.totalCost !== '') {
    const totalCost = parseFloat(req.body.totalCost);
    if (isNaN(totalCost) || totalCost < 0) {
      errors.push('Toplam maliyet geçerli bir sayı olmalıdır');
    }
  }

  if (req.body.paidAmount !== undefined && req.body.paidAmount !== '') {
    const paidAmount = parseFloat(req.body.paidAmount);
    if (isNaN(paidAmount) || paidAmount < 0) {
      errors.push('Ödenen tutar geçerli bir sayı olmalıdır');
    }

    if (req.body.totalCost && paidAmount > parseFloat(req.body.totalCost)) {
      errors.push('Ödenen tutar toplam maliyetten fazla olamaz');
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors,
      message: errors.join(', ')
    });
  }

  console.log('✅ Validation passed');
  // Continue to next middleware if validation passes
  next();
};

// Validation for customer updates (less strict, optional fields)
const validateCustomerUpdate = (req, res, next) => {
  const {
    tcIdentity,
    phone,
    email,
    firstName,
    lastName,
    passportNo,
    birthDate,
    passportExpiryDate,
    countryId,
    visaTypeId,
    officeId,
    priorityLevel
  } = req.body;

  const errors = [];

  // TC Identity validation if provided - BASITLEŞTIRILDI
  if (tcIdentity && !/^\d{11}$/.test(tcIdentity)) {
    errors.push('TC Kimlik No 11 haneli sayı olmalıdır');
  }

  // Phone validation if provided - GEVŞETILDI
  if (phone) {
    const cleanedPhone = phone.replace(/\D/g, '');

    const normalizedPhone = cleanedPhone.startsWith('0')
      ? cleanedPhone.slice(1)
      : cleanedPhone;

    if (!/^[5][0-9]{9}$/.test(normalizedPhone)) {
      errors.push('Geçerli bir telefon numarası girin (05XXXXXXXXX veya 5XXXXXXXXX)');
    }
  }

  // Email validation if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Geçerli bir e-posta adresi girin');
  }

  // Name validation if provided - GEVŞETILDI
  if (firstName && firstName.trim().length < 2) {
    errors.push('Ad en az 2 karakter olmalıdır');
  }

  if (lastName && lastName.trim().length < 2) {
    errors.push('Soyad en az 2 karakter olmalıdır');
  }

  // Passport format validation if provided - GEVŞETILDI
  if (passportNo && passportNo.length < 6) {
    errors.push('Pasaport No en az 6 karakter olmalıdır');
  }

  // Date validations if provided - BASITLEŞTIRILDI
  if (birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    
    if (birth >= today) {
      errors.push('Doğum tarihi bugünden önce olmalıdır');
    }
    
    if (age < 0 || age > 150) {
      errors.push('Geçerli bir doğum tarihi girin');
    }
  }

  if (passportExpiryDate) {
    const expiry = new Date(passportExpiryDate);
    const today = new Date();
    
    if (expiry <= today) {
      errors.push('Pasaport geçerlilik tarihi bugünden sonra olmalıdır');
    }
  }

  // ID validations if provided
  if (countryId && (!Number.isInteger(Number(countryId)) || Number(countryId) <= 0)) {
    errors.push('Geçerli bir ülke seçin');
  }

  if (visaTypeId && (!Number.isInteger(Number(visaTypeId)) || Number(visaTypeId) <= 0)) {
    errors.push('Geçerli bir vize türü seçin');
  }

  if (officeId && (!Number.isInteger(Number(officeId)) || Number(officeId) <= 0)) {
    errors.push('Geçerli bir ofis seçin');
  }

  // Priority level validation if provided
  if (priorityLevel && (priorityLevel < 1 || priorityLevel > 5)) {
    errors.push('Öncelik seviyesi 1-5 arasında olmalıdır');
  }

  // Cost validations if provided
  if (req.body.totalCost !== undefined && req.body.totalCost !== '') {
    const totalCost = parseFloat(req.body.totalCost);
    if (isNaN(totalCost) || totalCost < 0) {
      errors.push('Toplam maliyet geçerli bir sayı olmalıdır');
    }
  }

  if (req.body.paidAmount !== undefined && req.body.paidAmount !== '') {
    const paidAmount = parseFloat(req.body.paidAmount);
    if (isNaN(paidAmount) || paidAmount < 0) {
      errors.push('Ödenen tutar geçerli bir sayı olmalıdır');
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    console.log('❌ Update validation errors:', errors);
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors,
      message: errors.join(', ')
    });
  }

  console.log('✅ Update validation passed');
  // Continue to next middleware if validation passes
  next();
};

// Document validation
const validateDocument = (req, res, next) => {
  const { documentType } = req.body;
  const errors = [];

  // Check if file is uploaded
  if (!req.file) {
    errors.push('Dosya seçilmedi');
  } else {
    // File size validation (10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      errors.push('Dosya boyutu 10MB\'dan büyük olamaz');
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      errors.push('Desteklenmeyen dosya türü. Sadece JPG, PNG, PDF, DOC, DOCX dosyaları yükleyebilirsiniz');
    }
  }

  // Document type validation
  const validDocumentTypes = ['passport', 'photo', 'application_form', 'insurance', 'financial', 'other'];
  if (documentType && !validDocumentTypes.includes(documentType)) {
    errors.push('Geçersiz belge türü');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Dosya validasyon hatası',
      details: errors,
      message: errors.join(', ')
    });
  }

  next();
};

module.exports = {
  validateCustomer,
  validateCustomerUpdate,
  validateDocument
};