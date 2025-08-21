const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');

// Tüm ofisleri getir
router.get('/', async (req, res) => {
  try {
    const { countryId } = req.query;
    const where = countryId ? { countryId: parseInt(countryId) } : {};

    const offices = await prisma.office.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json(offices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ofisler yüklenirken hata oluştu' });
  }
});

// Yeni ofis ekle
router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const office = await prisma.office.create({
      data: { name, address, phone }
    });
    res.status(201).json(office);
  } catch (error) {
    res.status(400).json({ error: 'Ofis eklenemedi' });
  }
});

module.exports = router;