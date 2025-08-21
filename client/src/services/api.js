import axios from 'axios';

const API_BASE_URL = 'http://localhost:3008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - İstek öncesi işlemler
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Yanıt sonrası işlemler
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    // Network hatası
    if (!error.response) {
      throw new Error('🌐 Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
    }
    
    // HTTP hata kodları
    switch (error.response.status) {
      case 400:
        throw new Error(error.response.data?.error || '⚠️ Geçersiz istek.');
      case 401:
        throw new Error('🔐 Yetkilendirme hatası.');
      case 403:
        throw new Error('🚫 Bu işlem için yetkiniz yok.');
      case 404:
        throw new Error('🔍 Kaynak bulunamadı.');
      case 409:
        throw new Error(error.response.data?.error || '⚡ Çakışma hatası.');
      case 422:
        throw new Error(error.response.data?.error || '📝 Validasyon hatası.');
      case 500:
        throw new Error('🔧 Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      default:
        throw new Error(`❌ Beklenmeyen hata: ${error.response.status}`);
    }
  }
);

// Countries API
export const countriesAPI = {
  getAll: () => api.get('/countries'),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => api.post('/countries', data),
  update: (id, data) => api.put(`/countries/${id}`, data),
  delete: (id) => api.delete(`/countries/${id}`),
};

// Visa Types API
export const visaTypesAPI = {
  getAll: (countryId) => {
    if (countryId) {
      return api.get(`/visa-types?countryId=${countryId}`);
    }
    return api.get('/visa-types');
  },
  // diğer metodlar aynı kalır
};

// Offices API
export const officesAPI = {
  getAll: (countryId) => {
    if (countryId) {
      return api.get(`/offices?countryId=${countryId}`);
    }
    return api.get('/offices');
  },
  getById: (id) => api.get(`/offices/${id}`),
  create: (data) => api.post('/offices', data),
  update: (id, data) => api.put(`/offices/${id}`, data),
  delete: (id) => api.delete(`/offices/${id}`),
};

// Customers API - Enhanced with validation
export const customersAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    
    console.log('🔍 customersAPI.getAll çağrıldı, gelen filters:', filters);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
        console.log('🔍 URL parametresi eklendi:', key, '=', filters[key]);
      }
    });
    
    const finalUrl = `${API_BASE_URL}/customers?${params}`;
    console.log('🔍 Final API URL:', finalUrl);
    
    return api.get(`/customers?${params}`);
  },
  
  getById: (id) => {
    if (!id) throw new Error('Müşteri ID gerekli');
    return api.get(`/customers/${id}`);
  },
  
  create: async (data) => {
    // Frontend validasyonu
    const validation = validateCustomerData(data);
    if (!validation.isValid) {
      throw new Error(`Validasyon Hatası: ${validation.errors.join(', ')}`);
    }
    
    console.log('📝 Yeni müşteri oluşturuluyor:', data);
    return api.post('/customers', data);
  },
  
  update: async (id, data) => {
    if (!id) throw new Error('Müşteri ID gerekli');
    
    // Frontend validasyonu
    const validation = validateCustomerData(data, false); // Update için zorunlu alan kontrolü gevşetilmiş
    if (!validation.isValid) {
      throw new Error(`Validasyon Hatası: ${validation.errors.join(', ')}`);
    }
    
    console.log('✏️ Müşteri güncelleniyor:', id, data);
    return api.put(`/customers/${id}`, data);
  },
  
  delete: (id) => {
    if (!id) throw new Error('Müşteri ID gerekli');
    return api.delete(`/customers/${id}`);
  },
  
  bulkDelete: (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Silinecek müşteri ID\'leri gerekli');
    }
    return api.post('/customers/bulk-delete', { ids });
  },
  
  // Duplicate check
  checkDuplicate: (field, value, excludeId = null) => {
    const params = new URLSearchParams();
    params.append('field', field);
    params.append('value', value);
    if (excludeId) params.append('excludeId', excludeId);
    
    return api.get(`/customers/check-duplicate?${params}`);
  }
};

// Documents API
export const documentsAPI = {
  // Müşterinin belgelerini getir
  getCustomerDocuments: (customerId) => {
    if (!customerId) throw new Error('Müşteri ID gerekli');
    return api.get(`/documents/customer/${customerId}`);
  },
  
  // Belge yükle
  uploadDocument: (customerId, formData, onProgress = null) => {
    if (!customerId) throw new Error('Müşteri ID gerekli');
    if (!formData) throw new Error('Form data gerekli');
    
    return axios.post(
      `${API_BASE_URL}/documents/customer/${customerId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 saniye - dosya yükleme için daha uzun
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Upload Progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    );
  },
  
  // Belge indir
  downloadDocument: (documentId) => {
    if (!documentId) throw new Error('Belge ID gerekli');
    return axios.get(`${API_BASE_URL}/documents/${documentId}/download`, {
      responseType: 'blob',
      timeout: 30000, // 30 saniye
    });
  },
  
  // Belge görüntüle URL'i
  viewDocument: (documentId) => {
    if (!documentId) throw new Error('Belge ID gerekli');
    return `${API_BASE_URL}/documents/${documentId}/view`;
  },
  
  // Belge sil
  deleteDocument: (documentId) => {
    if (!documentId) throw new Error('Belge ID gerekli');
    return api.delete(`/documents/${documentId}`);
  },
  
  // Belge güncelle
  updateDocument: (documentId, data) => {
    if (!documentId) throw new Error('Belge ID gerekli');
    return api.put(`/documents/${documentId}`, data);
  },
  
  // Bulk belge silme
  bulkDeleteDocuments: (documentIds) => {
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new Error('Silinecek belge ID\'leri gerekli');
    }
    return api.post('/documents/bulk-delete', { ids: documentIds });
  }
};

// Additional Services API
export const additionalServicesAPI = {
  getAll: () => api.get('/additional-services'),
  getById: (id) => api.get(`/additional-services/${id}`),
  create: (data) => api.post('/additional-services', data),
  update: (id, data) => api.put(`/additional-services/${id}`, data),
  delete: (id) => api.delete(`/additional-services/${id}`),
};

// Reports API
export const reportsAPI = {
  getCustomerStats: () => api.get('/reports/customer-stats'),
  getCountryStats: () => api.get('/reports/country-stats'),
  getVisaTypeStats: () => api.get('/reports/visa-type-stats'),
  getMonthlyStats: (year) => api.get(`/reports/monthly-stats?year=${year}`),
  exportCustomers: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/reports/export-customers?${params}`, {
      responseType: 'blob'
    });
  }
};

// Utility Functions
export const validateCustomerData = (data, isCreate = true) => {
  const errors = [];
  
  // Zorunlu alanlar kontrolü
  if (isCreate) {
    if (!data.firstName?.trim()) errors.push('Ad gerekli');
    if (!data.lastName?.trim()) errors.push('Soyad gerekli');
    if (!data.birthDate) errors.push('Doğum tarihi gerekli');
    if (!data.passportNo?.trim()) errors.push('Pasaport numarası gerekli');
    if (!data.passportExpiryDate) errors.push('Pasaport geçerlilik tarihi gerekli');
    if (!data.tcIdentity?.trim()) errors.push('TC Kimlik numarası gerekli');
    if (!data.phone?.trim()) errors.push('Telefon numarası gerekli');
    if (!data.countryId) errors.push('Ülke seçimi gerekli');
    if (!data.visaTypeId) errors.push('Vize türü seçimi gerekli');
    if (!data.officeId) errors.push('Ofis seçimi gerekli');
  }
  
  // Format kontrolleri
  if (data.tcIdentity && !/^\d{11}$/.test(data.tcIdentity)) {
    errors.push('TC Kimlik numarası 11 haneli olmalı');
  }

  if (data.phone) {
    const cleaned = data.phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    if (!/^[5][0-9]{9}$/.test(normalized)) {
      errors.push('Geçerli bir telefon numarası girin (5XXXXXXXXX)');
    }
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Geçerli bir e-posta adresi girin');
  }
  
  // Tarih kontrolleri
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 120) {
      errors.push('Geçerli bir doğum tarihi girin');
    }
  }
  
  if (data.passportExpiryDate) {
    const expiryDate = new Date(data.passportExpiryDate);
    const today = new Date();
    
    if (expiryDate <= today) {
      errors.push('Pasaport geçerlilik tarihi gelecekte olmalı');
    }
  }
  
  // Maliyet kontrolleri
  if (data.totalCost && (isNaN(data.totalCost) || data.totalCost < 0)) {
    errors.push('Geçerli bir toplam maliyet girin');
  }
  
  if (data.paidAmount && (isNaN(data.paidAmount) || data.paidAmount < 0)) {
    errors.push('Geçerli bir ödenen tutar girin');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format helper functions
export const formatters = {
  currency: (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  },
  
  date: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR');
  },
  
  datetime: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('tr-TR');
  },
  
  phone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9, 11)}`;
    }
    return phone;
  },
  
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Constants
export const CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DOCUMENT_TYPES: {
    passport: 'Pasaport',
    photo: 'Fotoğraf',
    application_form: 'Başvuru Formu',
    insurance: 'Sigorta',
    financial: 'Mali Durum',
    other: 'Diğer'
  },
  PRIORITY_LEVELS: {
    1: 'Düşük',
    2: 'Düşük-Orta',
    3: 'Normal',
    4: 'Yüksek',
    5: 'Çok Acil'
  },
  APPOINTMENT_STATUS: {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    completed: 'Tamamlandı',
    cancelled: 'İptal'
  }
};

export default api;