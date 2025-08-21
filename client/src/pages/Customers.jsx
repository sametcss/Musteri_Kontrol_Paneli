import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, Fade, Slide } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomerFilters from '../components/Customer/CustomerFilters';
import CustomerTable from '../components/Customer/CustomerTable';
import CustomerForm from '../components/Customer/CustomerForm';
import CustomerDeleteDialog from '../components/Customer/CustomerDeleteDialog';
import CustomerDetailDialog from '../components/Customer/CustomerDetailDialog';
import BulkActionsDialog from '../components/Customer/BulkActionsDialog';
import { customersAPI, countriesAPI, visaTypesAPI, officesAPI } from '../services/api';

const Customers = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({ connected: true, checked: false });
  
  // Dropdown data
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [offices, setOffices] = useState([]);
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  
  // Selected items
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerToView, setCustomerToView] = useState(null);
  const [bulkCustomers, setBulkCustomers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check server connection on mount
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      // Basit API test çağrısı
      await customersAPI.getAll({});
      setConnectionStatus({ connected: true, checked: true });
    } catch (error) {
      setConnectionStatus({ connected: false, checked: true });
      setSnackbar({
        open: true,
        message: '⚠️ Server bağlantısı kurulamadı. Lütfen backend\'in çalıştığından emin olun.',
        severity: 'error'
      });
    }
  };

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      console.log('🔄 Loading dropdown data...');
      const [countriesRes, visaTypesRes, officesRes] = await Promise.all([
        countriesAPI.getAll(),
        visaTypesAPI.getAll(),
        officesAPI.getAll()
      ]);
      
      setCountries(countriesRes.data.data || []);
      setVisaTypes(visaTypesRes.data.data || []);
      setOffices(officesRes.data.data || []);
      
      console.log('✅ Dropdown data loaded:', {
        countries: countriesRes.data.data?.length || 0,
        visaTypes: visaTypesRes.data.data?.length || 0,
        offices: officesRes.data.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Dropdown verileri yüklenemedi:', error);
      setSnackbar({
        open: true,
        message: `Dropdown verileri yüklenemedi: ${error.message || 'Bilinmeyen hata'}`,
        severity: 'warning'
      });
    }
  };

  // Load customers
  const loadCustomers = async (currentFilters = filters) => {
    if (!connectionStatus.connected) {
      console.log('⚠️ Server connection not available, skipping customer load');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔄 Loading customers with filters:', currentFilters);
      const response = await customersAPI.getAll(currentFilters);
      const customerData = response.data.data || [];
      setCustomers(customerData);
      
      console.log(`✅ Loaded ${customerData.length} customers`);
      
      // Show success message only if we have filters applied
      if (Object.keys(currentFilters).length > 0) {
        setSnackbar({
          open: true,
          message: `🔍 ${customerData.length} müşteri bulundu`,
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('❌ Müşteriler yüklenirken hata:', error);
      setSnackbar({
        open: true,
        message: `Müşteriler yüklenirken hata: ${error.message || 'Bilinmeyen hata'}`,
        severity: 'error'
      });
      setCustomers([]); // Clear customers on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectionStatus.checked) {
      loadCustomers();
      loadDropdownData();
    }
  }, [refreshTrigger, connectionStatus.checked]);

  // Filters handler
  const handleFiltersChange = (newFilters) => {
    console.log('🔍 Filters changed:', newFilters);
    setFilters(newFilters);
    loadCustomers(newFilters);
  };

  // Add customer handler
  const handleAddCustomer = () => {
    console.log('➕ Opening new customer form');
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  // Export handler
  const handleExport = () => {
    setSnackbar({
      open: true,
      message: '📤 Dışa aktarma özelliği yakında eklenecek',
      severity: 'info'
    });
  };

  // Single customer actions
  const handleEdit = (customer) => {
    console.log('✏️ Editing customer:', customer.id);
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = (customer) => {
    console.log('🗑️ Deleting customer:', customer.id);
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleView = (customer) => {
    console.log('👁️ Viewing customer:', customer.id);
    setCustomerToView(customer);
    setDetailDialogOpen(true);
  };

  // Bulk actions
  const handleBulkEmail = (selectedIds) => {
    const selectedCustomers = customers.filter(customer => 
      selectedIds.includes(customer.id)
    );
    console.log('📧 Bulk email for customers:', selectedIds);
    setBulkCustomers(selectedCustomers);
    setBulkAction('email');
    setBulkDialogOpen(true);
  };

  const handleBulkExport = (selectedIds) => {
    const selectedCustomers = customers.filter(customer => 
      selectedIds.includes(customer.id)
    );
    console.log('📤 Bulk export for customers:', selectedIds);
    setBulkCustomers(selectedCustomers);
    setBulkAction('export');
    setBulkDialogOpen(true);
  };

  const handleBulkDelete = (selectedIds) => {
    const selectedCustomers = customers.filter(customer => 
      selectedIds.includes(customer.id)
    );
    console.log('🗑️ Bulk delete for customers:', selectedIds);
    setBulkCustomers(selectedCustomers);
    setBulkAction('delete');
    setBulkDialogOpen(true);
  };

  // Form handlers
  const handleFormClose = () => {
    console.log('❌ Closing customer form');
    setFormOpen(false);
    // setSelectedCustomer(null); // ❌ Bunu hemen silme!
    // Bunun yerine küçük bir gecikmeyle null'a çekiyoruz ki form sıfırlansın
    setTimeout(() => {
      setSelectedCustomer(null);
    }, 300); // 300ms beklemek yeterlidir
  };


  const handleFormSuccess = () => {
    const message = selectedCustomer 
      ? `✅ ${selectedCustomer.firstName} ${selectedCustomer.lastName} başarıyla güncellendi!`
      : '✅ Yeni müşteri başarıyla eklendi!';
    
    console.log('✅ Form success:', message);
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
    setRefreshTrigger(prev => prev + 1);
  };

  // Delete handlers
  const handleDeleteDialogClose = () => {
    console.log('❌ Closing delete dialog');
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleDeleteSuccess = (deletedCustomer) => {
    const message = `🗑️ ${deletedCustomer.firstName} ${deletedCustomer.lastName} başarıyla silindi!`;
    console.log('✅ Delete success:', message);
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
    setRefreshTrigger(prev => prev + 1);
  };

  // Detail handlers
  const handleDetailDialogClose = () => {
    console.log('❌ Closing detail dialog');
    setDetailDialogOpen(false);
    setCustomerToView(null);
  };

  const handleEditFromDetail = (customer) => {
    console.log('✏️ Edit from detail for customer:', customer.id);
    setDetailDialogOpen(false);
    setCustomerToView(null);
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  // Bulk handlers
  const handleBulkDialogClose = () => {
    console.log('❌ Closing bulk dialog');
    setBulkDialogOpen(false);
    setBulkCustomers([]);
    setBulkAction('');
  };

  const handleBulkSuccess = (action, count) => {
    const messages = {
      delete: `🗑️ ${count} müşteri başarıyla silindi!`,
      email: `📧 ${count} müşteriye e-posta gönderildi!`,
      export: `📤 ${count} müşteri bilgisi başarıyla dışa aktarıldı!`
    };

    const message = messages[action] || '✅ İşlem başarıyla tamamlandı!';
    console.log('✅ Bulk success:', message);
    
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });

    if (action === 'delete') {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fallback data for when API is not available
  const fallbackCountries = [
    { id: 1, name: 'Almanya', code: 'GER' },
    { id: 2, name: 'Amerika Birleşik Devletleri', code: 'USA' },
    { id: 3, name: 'İngiltere', code: 'GBR' },
    { id: 4, name: 'Fransa', code: 'FRA' },
    { id: 5, name: 'İtalya', code: 'ITA' },
    { id: 6, name: 'İspanya', code: 'ESP' }
  ];

  const fallbackVisaTypes = [
    { id: 1, name: 'Turistik', description: 'Turizm amaçlı seyahat' },
    { id: 2, name: 'Ticari', description: 'İş amaçlı seyahat' },
    { id: 3, name: 'Eğitim', description: 'Eğitim amaçlı seyahat' },
    { id: 4, name: 'Çalışma', description: 'Çalışma amaçlı seyahat' },
    { id: 5, name: 'Aile Ziyareti', description: 'Aile ziyareti' }
  ];

  const fallbackOffices = [
    { id: 1, name: 'İstanbul Merkez', address: 'Taksim Mah. İstiklal Cad. No:123', phone: '0212 555 0101' },
    { id: 2, name: 'Ankara Şube', address: 'Kızılay Mah. Atatürk Bulvarı No:456', phone: '0312 555 0102' },
    { id: 3, name: 'İzmir Şube', address: 'Alsancak Mah. Cumhuriyet Bulvarı No:789', phone: '0232 555 0103' }
  ];

  return (
    <Box sx={{ 
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      minHeight: '100vh',
      transition: 'background-color 0.3s ease'
    }}>
      <Fade in={true} timeout={500}>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: isDarkMode ? '#f1f5f9' : '#1f2937',
              fontWeight: 700,
              mb: 3
            }}
          >
            👥 Müşteri Yönetimi
          </Typography>
          
          {/* Connection Status Alert */}
          {connectionStatus.checked && !connectionStatus.connected && (
            <Slide direction="down" in={true} mountOnEnter unmountOnExit>
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2,
                  backgroundColor: isDarkMode ? '#422006' : '#fef3c7',
                  color: isDarkMode ? '#fbbf24' : '#92400e',
                  '& .MuiAlert-icon': {
                    color: isDarkMode ? '#fbbf24' : '#92400e'
                  }
                }}
              >
                ⚠️ Backend bağlantısı kurulamadı. Demo modunda çalışılıyor.
              </Alert>
            </Slide>
          )}
          
          {/* CustomerFilters */}
          <CustomerFilters
            onFiltersChange={handleFiltersChange}
            onAddCustomer={handleAddCustomer}
            onExport={handleExport}
            countries={countries.length > 0 ? countries : fallbackCountries}
            visaTypes={visaTypes.length > 0 ? visaTypes : fallbackVisaTypes}
            offices={offices.length > 0 ? offices : fallbackOffices}
          />
          
          <CustomerTable
            customers={customers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
          />
        </Box>
      </Fade>

      {/* Müşteri Formu */}
      <CustomerForm
        key={formOpen ? 'open' : 'closed'} // ✅ FORM YENİDEN YARATILIR
        open={formOpen}
        onClose={handleFormClose}
        customer={selectedCustomer}
        onSuccess={handleFormSuccess}
        countries={countries.length > 0 ? countries : fallbackCountries}
        visaTypes={visaTypes.length > 0 ? visaTypes : fallbackVisaTypes}
        offices={offices.length > 0 ? offices : fallbackOffices}
      />


      {/* Silme Onay Modalı */}
      <CustomerDeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        customer={customerToDelete}
        onSuccess={handleDeleteSuccess}
      />

      {/* Detay Görüntüleme Modalı */}
      <CustomerDetailDialog
        open={detailDialogOpen}
        onClose={handleDetailDialogClose}
        customer={customerToView}
        onEdit={handleEditFromDetail}
      />

      {/* Bulk İşlemler Modalı */}
      <BulkActionsDialog
        open={bulkDialogOpen}
        onClose={handleBulkDialogClose}
        customers={bulkCustomers}
        action={bulkAction}
        onSuccess={handleBulkSuccess}
      />

      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{
            backgroundColor: isDarkMode 
              ? (snackbar.severity === 'success' ? '#0f2418' : snackbar.severity === 'error' ? '#2d1b1b' : '#172554')
              : undefined,
            color: isDarkMode
              ? (snackbar.severity === 'success' ? '#22c55e' : snackbar.severity === 'error' ? '#ef4444' : '#60a5fa')
              : undefined,
            '& .MuiAlert-icon': {
              color: isDarkMode
                ? (snackbar.severity === 'success' ? '#22c55e' : snackbar.severity === 'error' ? '#ef4444' : '#60a5fa')
                : undefined
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;