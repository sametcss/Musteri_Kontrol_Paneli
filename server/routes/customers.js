router.get('/', async (req, res) => {
  try {
    const { country, status, priority, visaType, office, search } = req.query;
    
    console.log('🔍 Backend - Gelen query params:', req.query); // DEBUG LOG
    
    const where = {};
    
    // Filtreler
    if (country) where.countryId = parseInt(country);
    if (status) where.status = status;
    if (priority) where.priorityLevel = parseInt(priority);
    if (visaType) where.visaTypeId = parseInt(visaType); // BU SATIR VAR MI?
    if (office) where.officeId = parseInt(office);
    
    console.log('🔍 Backend - Where objesi:', where); // DEBUG LOG
    
    // Arama
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { passportNo: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        country: true,
        visaType: true,
        office: true
      },
      orderBy: [
        { priorityLevel: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('🔍 Backend - Bulunan müşteri sayısı:', customers.length); // DEBUG LOG

    res.json({
      message: 'Customers loaded successfully',
      data: customers,
      count: customers.length,
      filters: { country, status, priority, visaType, office, search }
    });
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ 
      error: 'Could not load customers',
      details: error.message 
    });
  }
});