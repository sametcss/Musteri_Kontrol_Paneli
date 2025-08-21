const prisma = require('../prisma-client');

// Tüm müşterileri getir
const getAllCustomers = async (req, res) => {
  try {
    const { country, status, priority, visaType, office, search } = req.query;

    console.log('🔍 Fetching customers with filters:', { country, status, priority, visaType, office, search });

    const where = {};

    if (country) where.countryId = parseInt(country);
    if (status) where.status = status;
    if (priority) where.priorityLevel = parseInt(priority);
    if (visaType) where.visaTypeId = parseInt(visaType);
    if (office) where.officeId = parseInt(office);

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { passportNo: { contains: search, mode: 'insensitive' } },
        { tcIdentity: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        country: true,
        visaType: true,
        office: true,
        documents: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' }
        }
      },
      orderBy: [{ priorityLevel: 'desc' }, { createdAt: 'desc' }]
    });

    console.log(`✅ Found ${customers.length} customers`);

    res.json({
      message: 'Customers loaded successfully',
      data: customers,
      count: customers.length,
      filters: { country, status, priority, visaType, office, search }
    });
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    res.status(500).json({
      error: 'Müşteriler getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Tek müşteri getir
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Fetching customer with ID: ${id}`);

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        country: true,
        visaType: true,
        office: true,
        documents: {
          where: { isActive: true },
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!customer) {
      console.log(`❌ Customer not found with ID: ${id}`);
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    console.log(`✅ Customer found: ${customer.firstName} ${customer.lastName}`);

    res.json({ message: 'Müşteri bulundu', data: customer });
  } catch (error) {
    console.error(`❌ Error fetching customer ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Müşteri getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Yeni müşteri oluştur
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    console.log('📝 Creating new customer:', {
      name: `${customerData.firstName} ${customerData.lastName}`,
      passport: customerData.passportNo,
      tcIdentity: customerData.tcIdentity
    });

    // Tarihler
    if (customerData.birthDate) customerData.birthDate = new Date(customerData.birthDate);
    if (customerData.passportExpiryDate) customerData.passportExpiryDate = new Date(customerData.passportExpiryDate);
    customerData.appointmentDate =
      customerData.appointmentDate && customerData.appointmentDate !== '' ? new Date(customerData.appointmentDate) : null;
    customerData.visaExpiryDate =
      customerData.visaExpiryDate && customerData.visaExpiryDate !== '' ? new Date(customerData.visaExpiryDate) : null;

    // Telefon
    if (customerData.phone) {
      customerData.phone = customerData.phone.replace(/\D/g, '');
      if (customerData.phone.length === 11 && customerData.phone.startsWith('0')) customerData.phone = customerData.phone.slice(1);
    }

    // Sayısallar
    if (customerData.countryId) customerData.countryId = parseInt(customerData.countryId);
    if (customerData.visaTypeId) customerData.visaTypeId = parseInt(customerData.visaTypeId);
    if (customerData.officeId) customerData.officeId = parseInt(customerData.officeId);
    if (customerData.priorityLevel) customerData.priorityLevel = parseInt(customerData.priorityLevel);

    const toNumOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    customerData.totalCost = toNumOrNull(customerData.totalCost);
    customerData.paidAmount = toNumOrNull(customerData.paidAmount);
    customerData.remainingAmount = toNumOrNull(customerData.remainingAmount);

    if (customerData.totalCost != null && customerData.paidAmount != null) {
      customerData.remainingAmount = Number(customerData.totalCost) - Number(customerData.paidAmount);
    }

    customerData.documentsComplete = Boolean(customerData.documentsComplete);

    if (customerData.passportNo) customerData.passportNo = customerData.passportNo.trim();
    if (customerData.tcIdentity) customerData.tcIdentity = customerData.tcIdentity.trim();
    if (customerData.phone) customerData.phone = customerData.phone.trim();

    // Benzersiz kontroller
    const existingTc = await prisma.customer.findUnique({ where: { tcIdentity: customerData.tcIdentity } });
    if (existingTc) return res.status(409).json({ error: 'Bu TC Kimlik No ile kayıtlı müşteri zaten mevcut', field: 'tcIdentity' });

    const existingPass = await prisma.customer.findUnique({ where: { passportNo: customerData.passportNo } });
    if (existingPass) return res.status(409).json({ error: 'Bu Pasaport No ile kayıtlı müşteri zaten mevcut', field: 'passportNo' });

    const customer = await prisma.customer.create({
      data: customerData,
      include: { country: true, visaType: true, office: true, documents: true }
    });

    console.log(`✅ Customer created successfully: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);

    res.status(201).json({ message: 'Müşteri başarıyla eklendi', data: customer });
  } catch (error) {
    console.error('❌ Customer creation failed:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      const map = {
        tcIdentity: 'Bu TC Kimlik No ile kayıtlı müşteri zaten mevcut',
        passportNo: 'Bu Pasaport No ile kayıtlı müşteri zaten mevcut'
      };
      return res.status(409).json({ error: map[field] || 'Bu bilgilerle kayıtlı müşteri zaten mevcut', field });
    }

    res.status(400).json({
      error: 'Müşteri eklenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Geçersiz veri'
    });
  }
};

// Müşteri güncelle
const updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Kayıt var mı
    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) return res.status(404).json({ error: 'Müşteri bulunamadı' });

    // Tüm giriş
    const updateData = { ...req.body };

    // Boş stringleri null yap
    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === '') updateData[k] = null;
    });

    // Telefon normalize
    if (updateData.phone) {
      updateData.phone = String(updateData.phone).replace(/\D/g, '');
      if (updateData.phone.length === 11 && updateData.phone.startsWith('0')) {
        updateData.phone = updateData.phone.slice(1);
      }
    }

    // Tarihler
    if (updateData.birthDate) updateData.birthDate = new Date(updateData.birthDate);
    if (updateData.passportExpiryDate) updateData.passportExpiryDate = new Date(updateData.passportExpiryDate);
    if (updateData.appointmentDate) updateData.appointmentDate = new Date(updateData.appointmentDate);
    if (updateData.visaExpiryDate) updateData.visaExpiryDate = new Date(updateData.visaExpiryDate);

    // ID/sayısal alanlar
    if (updateData.countryId) updateData.countryId = Number(updateData.countryId);
    if (updateData.visaTypeId) updateData.visaTypeId = Number(updateData.visaTypeId);
    if (updateData.officeId) updateData.officeId = Number(updateData.officeId);
    if (updateData.priorityLevel) updateData.priorityLevel = Number(updateData.priorityLevel);

    // Para alanları
    const toNumOrKeep = (v, prev) => (v === null || v === undefined ? prev : Number(v));
    updateData.totalCost = toNumOrKeep(updateData.totalCost, existingCustomer.totalCost ?? null);
    updateData.paidAmount = toNumOrKeep(updateData.paidAmount, existingCustomer.paidAmount ?? null);
    if (updateData.totalCost != null || updateData.paidAmount != null) {
      const total = updateData.totalCost != null ? updateData.totalCost : Number(existingCustomer.totalCost || 0);
      const paid  = updateData.paidAmount != null ? updateData.paidAmount : Number(existingCustomer.paidAmount || 0);
      updateData.remainingAmount = total - paid;
    }

    // Benzersiz alan kontrolleri (mevcut kaydı hariç tut)
    if (updateData.tcIdentity && updateData.tcIdentity !== existingCustomer.tcIdentity) {
      const dupTc = await prisma.customer.findUnique({ where: { tcIdentity: updateData.tcIdentity } });
      if (dupTc) return res.status(409).json({ error: 'Bu TC Kimlik No ile kayıtlı başka müşteri mevcut', field: 'tcIdentity' });
    }
    if (updateData.passportNo && updateData.passportNo !== existingCustomer.passportNo) {
      const dupPass = await prisma.customer.findUnique({ where: { passportNo: updateData.passportNo } });
      if (dupPass) return res.status(409).json({ error: 'Bu Pasaport No ile kayıtlı başka müşteri mevcut', field: 'passportNo' });
    }

    // Güncelle
    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        country: true,
        visaType: true,
        office: true,
        documents: { where: { isActive: true }, orderBy: { uploadedAt: 'desc' } }
      }
    });

    return res.json({ message: 'Müşteri başarıyla güncellendi', data: customer });
  } catch (error) {
    console.error('❌ updateCustomer error:', error);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'unique';
      return res.status(409).json({ error: 'Benzersiz alan ihlali', field });
    }
    return res.status(500).json({
      error: 'Müşteri güncellenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Müşteri sil
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting customer ${id}`);

    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: { documents: { where: { isActive: true } } }
    });

    if (!existingCustomer) {
      console.log(`❌ Customer not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    if (existingCustomer.documents.length > 0) {
      await prisma.document.updateMany({ where: { customerId: parseInt(id) }, data: { isActive: false } });
      console.log(`📎 Soft deleted ${existingCustomer.documents.length} documents`);
    }

    await prisma.customer.delete({ where: { id: parseInt(id) } });

    console.log(`✅ Customer deleted successfully: ${existingCustomer.firstName} ${existingCustomer.lastName} (ID: ${id})`);

    res.json({
      message: 'Müşteri başarıyla silindi',
      deletedId: parseInt(id),
      deletedCustomer: { id: existingCustomer.id, firstName: existingCustomer.firstName, lastName: existingCustomer.lastName }
    });
  } catch (error) {
    console.error(`❌ Customer deletion failed for ID ${req.params.id}:`, error);

    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Bu müşteri silinemez, bağlı kayıtlar mevcut',
        details: 'Önce ilgili belgeleri ve işlemleri silmelisiniz'
      });
    }

    res.status(500).json({
      error: 'Müşteri silinemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Bulk operations
const bulkDeleteCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ error: "Geçerli müşteri ID'leri gönderilmedi" });
    }

    console.log(`🗑️ Bulk deleting ${customerIds.length} customers:`, customerIds);

    const customersToDelete = await prisma.customer.findMany({
      where: { id: { in: customerIds.map((id) => parseInt(id)) } },
      select: { id: true, firstName: true, lastName: true }
    });

    await prisma.document.updateMany({
      where: { customerId: { in: customerIds.map((id) => parseInt(id)) } },
      data: { isActive: false }
    });

    const result = await prisma.customer.deleteMany({
      where: { id: { in: customerIds.map((id) => parseInt(id)) } }
    });

    console.log(`✅ Bulk deleted ${result.count} customers`);

    res.json({
      message: `${result.count} müşteri başarıyla silindi`,
      deletedCount: result.count,
      deletedCustomers: customersToDelete
    });
  } catch (error) {
    console.error('❌ Bulk delete failed:', error);
    res.status(500).json({
      error: 'Toplu silme işlemi başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Customer statistics
const getCustomerStats = async (req, res) => {
  try {
    console.log('📊 Fetching customer statistics...');

    const [
      totalCustomers,
      pendingAppointments,
      completedDocuments,
      highPriorityCustomers,
      recentCustomers,
      countryStats,
      visaTypeStats,
      officeStats
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { appointmentStatus: 'pending' } }),
      prisma.customer.count({ where: { documentsComplete: true } }),
      prisma.customer.count({ where: { priorityLevel: { gte: 4 } } }),
      prisma.customer.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.customer.groupBy({ by: ['countryId'], _count: { countryId: true } }),
      prisma.customer.groupBy({ by: ['visaTypeId'], _count: { visaTypeId: true } }),
      prisma.customer.groupBy({ by: ['officeId'], _count: { officeId: true } })
    ]);

    console.log('✅ Customer statistics fetched successfully');

    res.json({
      message: 'İstatistikler başarıyla getirildi',
      data: {
        summary: { totalCustomers, pendingAppointments, completedDocuments, highPriorityCustomers, recentCustomers },
        distribution: { byCountry: countryStats, byVisaType: visaTypeStats, byOffice: officeStats }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching customer statistics:', error);
    res.status(500).json({
      error: 'İstatistikler getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Search customers
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Arama terimi en az 2 karakter olmalıdır' });
    }

    console.log(`🔍 Searching customers with query: "${q}"`);

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { passportNo: { contains: q, mode: 'insensitive' } },
          { tcIdentity: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        country: { select: { name: true, code: true } },
        visaType: { select: { name: true } },
        office: { select: { name: true } }
      },
      take: 50,
      orderBy: [{ priorityLevel: 'desc' }, { createdAt: 'desc' }]
    });

    console.log(`✅ Found ${customers.length} customers matching "${q}"`);

    res.json({ message: `${customers.length} müşteri bulundu`, data: customers, query: q, count: customers.length });
  } catch (error) {
    console.error(`❌ Search failed for query "${req.query.q}":`, error);
    res.status(500).json({
      error: 'Arama işlemi başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

// Update customer status
const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Geçersiz durum', validStatuses });

    console.log(`📝 Updating customer ${id} status to: ${status}`);

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { country: true, visaType: true, office: true }
    });

    console.log(`✅ Customer status updated: ${customer.firstName} ${customer.lastName} -> ${status}`);

    res.json({ message: 'Müşteri durumu güncellendi', data: customer });
  } catch (error) {
    console.error(`❌ Status update failed for customer ${req.params.id}:`, error);

    if (error.code === 'P2025') return res.status(404).json({ error: 'Müşteri bulunamadı' });

    res.status(500).json({
      error: 'Durum güncellenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Sunucu hatası'
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
  getCustomerStats,
  searchCustomers,
  updateCustomerStatus
};
