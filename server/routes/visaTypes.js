const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');

// Tüm vize türlerini getir
router.get('/', async (req, res) => {
  try {
    const visaTypes = await prisma.visaType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(visaTypes);
  } catch (error) {
    res.status(500).json({ error: 'Vize türleri getirilemedi' });
  }
});

// Yeni vize türü ekle
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const visaType = await prisma.visaType.create({
      data: { name, description }
    });
    res.status(201).json(visaType);
  } catch (error) {
    res.status(400).json({ error: 'Vize türü eklenemedi' });
  }
});

module.exports = router;