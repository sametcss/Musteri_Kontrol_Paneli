const express = require('express');
const router = express.Router();
const {
  upload,
  getCustomerDocuments,
  uploadDocument,
  downloadDocument,
  viewDocument,
  deleteDocument,
  updateDocument
} = require('../controllers/documentsController');

// Müşterinin belgelerini getir
router.get('/customer/:customerId', getCustomerDocuments);

// Belge yükle
router.post('/customer/:customerId/upload', upload.single('document'), uploadDocument);

// Belge indir
router.get('/:documentId/download', downloadDocument);

// Belge görüntüle
router.get('/:documentId/view', viewDocument);

// Belge sil
router.delete('/:documentId', deleteDocument);

// Belge güncelle
router.put('/:documentId', updateDocument);

module.exports = router;