const express = require('express');
const router = express.Router();
const prisma = require('../prisma-client');

// Tüm ülkeleri getir
router.get('/', async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Ülkeler getirilemedi' });
  }
});

// Yeni ülke ekle
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    const country = await prisma.country.create({
      data: { name, code }
    });
    res.status(201).json(country);
  } catch (error) {
    res.status(400).json({ error: 'Ülke eklenemedi' });
  }
});

module.exports = router;