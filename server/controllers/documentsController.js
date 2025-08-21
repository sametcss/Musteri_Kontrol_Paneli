const prisma = require('../prisma-client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Dosya yükleme için storage yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Dosya adını benzersiz yap
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

// Müşterinin belgelerini getir
const getCustomerDocuments = async (req, res) => {
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
};

// Belge yükle
const uploadDocument = async (req, res) => {
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
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Hata durumunda dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Belge yüklenemedi' });
  }
};

// Belge indir
const downloadDocument = async (req, res) => {
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
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    
    // Dosyayı indir
    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Belge indirilemedi' });
  }
};

// Belge görüntüle (preview)
const viewDocument = async (req, res) => {
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
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }
    
    // Content-Type belirle
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Dosyayı stream et
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ error: 'Belge görüntülenemedi' });
  }
};

// Belge sil
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }
    
    // Veritabanından sil (soft delete)
    await prisma.document.update({
      where: { id: parseInt(documentId) },
      data: { isActive: false }
    });
    
    // İsteğe bağlı: Fiziksel dosyayı da sil
    // if (fs.existsSync(document.filePath)) {
    //   fs.unlinkSync(document.filePath);
    // }
    
    res.json({ message: 'Belge silindi' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Belge silinemedi' });
  }
};

// Belge bilgilerini güncelle
const updateDocument = async (req, res) => {
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
    
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Belge güncellenemedi' });
  }
};

module.exports = {
  upload,
  getCustomerDocuments,
  uploadDocument,
  downloadDocument,
  viewDocument,
  deleteDocument,
  updateDocument
};