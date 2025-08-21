const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./prisma-client');
const { validateCustomer, validateCustomerUpdate, validateDocument } = require('./middleware/validationMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl}`);
  next();
});

// Dosya yükleme için storage yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/documents');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü. Sadece JPG, PNG, PDF, DOC, DOCX dosyaları yükleyebilirsiniz.'), false);
  }
};

// Multer yapılandırması
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ===================
// BASIC ROUTES
// ===================

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Visa Management System API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      countries: '/api/countries',
      visaTypes: '/api/visa-types',
      offices: '/api/offices',
      customers: '/api/customers',
      documents: '/api/documents'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API test successful!',
    timestamp: new Date().toISOString()
  });
});

// ===================
// REFERENCE DATA APIs
// ===================

// Countries API
app.get('/api/countries', async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json({
      message: 'Countries loaded successfully',
      data: countries,
      count: countries.length
    });
  } catch (error) {
    console.error('Countries error:', error);
    res.status(500).json({ 
      error: 'Could not load countries',
      details: error.message 
    });
  }
});

// Visa Types API
app.get('/api/visa-types', async (req, res) => {
  const { countryId } = req.query;
  try {
    const where = countryId ? {
      isActive: true,
      countries: { some: { countryId: parseInt(countryId,10), isActive: true } }
    } : { isActive: true };
    const visaTypes = await prisma.visaType.findMany({ where, orderBy: { name: 'asc' }});
    res.json({ message:'Visa types loaded successfully', data: visaTypes, count: visaTypes.length });
  } catch (e) { res.status(500).json({ error:'Could not load visa types' }); }
});


// Offices API
app.get('/api/offices', async (req, res) => {
  try {
    const { countryId } = req.query;

    const where = countryId
      ? {
          isActive: true,
          // M:N ilişki: ülkeye bağlı ofisleri getir
          countries: { some: { id: parseInt(countryId, 10) } },
        }
      : { isActive: true };

    const offices = await prisma.office.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      message: 'Offices loaded successfully',
      data: offices,
      count: offices.length,
    });
  } catch (error) {
    console.error('Offices error:', error);
    res.status(500).json({
      error: 'Could not load offices',
      details: error.message,
    });
  }
});

// ===================
// CUSTOMERS API
// ===================

// Import customer controller
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
  getCustomerStats,
  searchCustomers,
  updateCustomerStatus
} = require('./controllers/customersController');

// Customer Routes with validation
app.get('/api/customers', getAllCustomers);
app.get('/api/customers/stats', getCustomerStats);
app.get('/api/customers/search', searchCustomers);
app.get('/api/customers/:id', getCustomerById);
app.post('/api/customers', validateCustomer, createCustomer);
app.put('/api/customers/:id', validateCustomerUpdate, updateCustomer);
app.patch('/api/customers/:id/status', updateCustomerStatus);
app.delete('/api/customers/:id', deleteCustomer);
app.delete('/api/customers', bulkDeleteCustomers);

// ===================
// DOCUMENTS API
// ===================

// Müşterinin belgelerini getir
app.get('/api/documents/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const documents = await prisma.document.findMany({
      where: {
        customerId: parseInt(customerId),
        isActive: true
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Belgeler getirilemedi' });
  }
});

// Belge yükle
app.post('/api/documents/customer/:customerId/upload', upload.single('document'), validateDocument, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { documentType, uploadedBy } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya seçilmedi' });
    }
    
    // Müşteri var mı kontrol et
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) }
    });
    
    if (!customer) {
      // Yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    // Veritabanına kaydet
    const document = await prisma.document.create({
      data: {
        customerId: parseInt(customerId),
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType: documentType || 'other',
        filePath: req.file.path,
        uploadedBy: uploadedBy || 'system'
      }
    });
    
    // Update customer documents completion status
    const documentCount = await prisma.document.count({
      where: { customerId: parseInt(customerId), isActive: true }
    });
    
    const documentsComplete = documentCount >= 3;
    
    await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: { documentsComplete }
    });
    
    console.log(`✅ Document uploaded for customer ${customerId}: ${req.file.originalname}`);
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Hata durumunda dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Belge yüklenemedi' });
  }
});

// Belge indir
app.get('/api/documents/:documentId/download', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { 
        id: parseInt(documentId),
        isActive: true 
      }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    
    console.log(`📥 Document downloaded: ${document.originalName}`);
    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Belge indirilemedi' });
  }
});

// Belge görüntüle (preview)
app.get('/api/documents/:documentId/view', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { 
        id: parseInt(documentId),
        isActive: true 
      }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    console.log(`👁️ Document viewed: ${document.originalName}`);
    
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ error: 'Belge görüntülenemedi' });
  }
});

// Belge sil
app.delete('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }
    
    await prisma.document.update({
      where: { id: parseInt(documentId) },
      data: { isActive: false }
    });
    
    // Update customer documents completion status
    const documentCount = await prisma.document.count({
      where: { customerId: document.customerId, isActive: true }
    });
    
    const documentsComplete = documentCount >= 3;
    
    await prisma.customer.update({
      where: { id: document.customerId },
      data: { documentsComplete }
    });
    
    console.log(`🗑️ Document deleted: ${document.originalName}`);
    res.json({ message: 'Belge silindi' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Belge silinemedi' });
  }
});

// Belge bilgilerini güncelle
app.put('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { documentType, originalName } = req.body;
    
    const document = await prisma.document.update({
      where: { id: parseInt(documentId) },
      data: {
        documentType,
        originalName
      }
    });
    
    console.log(`📝 Document updated: ${document.originalName}`);
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Belge güncellenemedi' });
  }
});

// ===================
// ERROR HANDLING
// ===================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.' 
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Beklenmeyen dosya alanı.' 
    });
  }
  
  if (err.message && err.message.includes('Desteklenmeyen dosya türü')) {
    return res.status(400).json({
      error: err.message
    });
  }
  
  res.status(500).json({ 
    error: 'Sunucu hatası oluştu',
    message: process.env.NODE_ENV === 'development' ? err.message : 'İç sunucu hatası'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// ===================
// SERVER START
// ===================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}`);
  console.log(`📁 Document uploads will be stored in: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});