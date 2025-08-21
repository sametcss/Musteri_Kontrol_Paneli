import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Rating,
  Card,
  CardContent,
  Alert,
  TextField,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Person,
  Edit,
  Close,
  Phone,
  Email,
  Public,
  Business,
  CalendarToday,
  Description,
  FileCopy,
  Download,
  Visibility,
  Delete,
  AttachFile,
  Flag,
  LocationOn,
  CloudUpload
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AppointmentEditDialog from './AppointmentEditDialog';
import VisaExpiryEditDialog from './VisaExpiryEditDialog';
import CostEditDialog from './CostEditDialog';
import { documentsAPI } from '../../services/api';


const CustomerDetailDialog = ({ 
  open, 
  onClose, 
  customer, 
  onEdit 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [visaDialogOpen, setVisaDialogOpen] = useState(false);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Customer değiştiğinde notları güncelle
  useEffect(() => {
    if (customer) {
      setNotesValue(customer.notes || '');
      loadDocuments(); // Bu satırı ekleyin
    }
  }, [customer]);

  // 🎯 EARLY RETURN - Customer yoksa hiçbir şey render etme
  if (!customer) {
    return null;
  }

  // Artık customer kesinlikle var! Güvenle kullanabiliriz
  const handleCopyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`✅ ${label} kopyalandı: ${text}`);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };
  // Belgeleri yükle
const loadDocuments = async () => {
  if (!customer?.id) return;
  
  setLoadingDocuments(true);
  try {
    const response = await documentsAPI.getCustomerDocuments(customer.id);
    setDocuments(response.data);
  } catch (error) {
    console.error('Belgeler yüklenemedi:', error);
    showSnackbar('Belgeler yüklenemedi', 'error');
  } finally {
    setLoadingDocuments(false);
  }
};

// Snackbar göster
const showSnackbar = (message, severity = 'success') => {
  setSnackbar({ open: true, message, severity });
};

// Dosya yükle
const handleFileUpload = async (files) => {
  if (!customer?.id || !files.length) return;

  setUploadingFile(true);
  try {
    const promises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', getDocumentTypeFromFile(file));
      formData.append('uploadedBy', 'current_user'); // TODO: Gerçek kullanıcı bilgisi

      return documentsAPI.uploadDocument(customer.id, formData);
    });

    await Promise.all(promises);
    showSnackbar(`${files.length} belge başarıyla yüklendi`);
    loadDocuments(); // Belge listesini yenile
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    showSnackbar('Belgeler yüklenemedi', 'error');
  } finally {
    setUploadingFile(false);
  }
};

// Dosya türünü belirle
const getDocumentTypeFromFile = (file) => {
  const name = file.name.toLowerCase();
  if (name.includes('pasaport') || name.includes('passport')) return 'passport';
  if (name.includes('foto') || name.includes('photo')) return 'photo';
  if (name.includes('form') || name.includes('basvuru')) return 'application_form';
  return 'other';
};

// Belge indir
const handleDownloadDocument = async (doc) => {
  try {
    const response = await documentsAPI.downloadDocument(doc.id);
    
    // Blob URL oluştur ve indir
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    showSnackbar('Belge indirildi');
  } catch (error) {
    console.error('İndirme hatası:', error);
    showSnackbar('Belge indirilemedi', 'error');
  }
};

// Belge görüntüle
const handleViewDocument = (doc) => {
  const url = documentsAPI.viewDocument(doc.id);
  window.open(url, '_blank');
};

// Belge sil
const handleDeleteDocument = async (doc) => {
  if (!window.confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) return;

  try {
    await documentsAPI.deleteDocument(doc.id);
    showSnackbar('Belge silindi');
    loadDocuments(); // Listeyi yenile
  } catch (error) {
    console.error('Silme hatası:', error);
    showSnackbar('Belge silinemedi', 'error');
  }
};

// Yeni fonksiyon ekleyin
const getDocumentTypeLabel = (type) => {
  const types = {
    'passport': '📄 Pasaport',
    'photo': '📸 Fotoğraf',
    'application_form': '📋 Başvuru Formu',
    'other': '📎 Diğer'
  };
  return types[type] || '📎 Diğer';
};

  const getCountryFlag = (countryCode) => {
    const flags = {
      'GER': '🇩🇪',
      'USA': '🇺🇸',
      'GBR': '🇬🇧',
      'FRA': '🇫🇷',
      'ITA': '🇮🇹',
      'ESP': '🇪🇸'
    };
    return flags[countryCode] || '🌍';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getPriorityColor = (priority) => {
    if (priority >= 5) return 'error';
    if (priority >= 4) return 'warning';
    if (priority >= 3) return 'info';
    return 'success';
  };

  const getPriorityText = (priority) => {
    const texts = {
      1: '🟢 Düşük Öncelik',
      2: '🟡 Düşük-Orta Öncelik',
      3: '🟠 Normal Öncelik',
      4: '🔴 Yüksek Öncelik',
      5: '🚨 Çok Acil'
    };
    return texts[priority] || 'Belirsiz';
  };

  // Mock dosya verileri - gerçekte API'den gelecek
  const mockDocuments = [
    {
      id: 1,
      name: 'pasaport_fotokopisi.pdf',
      type: 'application/pdf',
      size: 245760,
      uploadDate: new Date(),
      documentType: 'passport'
    },
    {
      id: 2,
      name: 'vize_basvuru_formu.pdf',
      type: 'application/pdf',
      size: 1024000,
      uploadDate: new Date(),
      documentType: 'application_form'
    },
    {
      id: 3,
      name: 'fotograf.jpg',
      type: 'image/jpeg',
      size: 512000,
      uploadDate: new Date(),
      documentType: 'photo'
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (type) => {
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3, 
          minHeight: '80vh',
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          border: isDarkMode ? '1px solid #334155' : 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            width: 56, 
            height: 56,
            fontSize: '24px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            {customer.firstName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {customer.firstName} {customer.lastName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {customer.passportNo} • {customer.country?.name}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab Navigation */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e0e0e0'}`,
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff'
          }}
        >
          <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
            <Button
              variant={activeTab === 'details' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('details')}
              startIcon={<Person />}
              size="small"
              sx={{
                borderColor: isDarkMode ? '#475569' : 'primary.main',
                color: activeTab === 'details' 
                  ? 'white' 
                  : (isDarkMode ? '#cbd5e1' : 'primary.main'),
                backgroundColor: activeTab === 'details' 
                  ? (isDarkMode ? '#3b82f6' : 'primary.main')
                  : 'transparent',
                '&:hover': {
                  backgroundColor: activeTab === 'details' 
                    ? (isDarkMode ? '#2563eb' : 'primary.dark')
                    : (isDarkMode ? '#334155' : 'primary.light'),
                }
              }}
            >
              Detaylar
            </Button>
            <Button
              variant={activeTab === 'appointment' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('appointment')}
              startIcon={<CalendarToday />}
              size="small"
              sx={{
                borderColor: isDarkMode ? '#475569' : 'primary.main',
                color: activeTab === 'appointment' 
                  ? 'white' 
                  : (isDarkMode ? '#cbd5e1' : 'primary.main'),
                backgroundColor: activeTab === 'appointment' 
                  ? (isDarkMode ? '#3b82f6' : 'primary.main')
                  : 'transparent',
                '&:hover': {
                  backgroundColor: activeTab === 'appointment' 
                    ? (isDarkMode ? '#2563eb' : 'primary.dark')
                    : (isDarkMode ? '#334155' : 'primary.light'),
                }
              }}
            >
              Randevu & Maliyet
            </Button>
            <Button
              variant={activeTab === 'documents' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('documents')}
              startIcon={<AttachFile />}
              size="small"
              sx={{
                borderColor: isDarkMode ? '#475569' : 'primary.main',
                color: activeTab === 'documents' 
                  ? 'white' 
                  : (isDarkMode ? '#cbd5e1' : 'primary.main'),
                backgroundColor: activeTab === 'documents' 
                  ? (isDarkMode ? '#3b82f6' : 'primary.main')
                  : 'transparent',
                '&:hover': {
                  backgroundColor: activeTab === 'documents' 
                    ? (isDarkMode ? '#2563eb' : 'primary.dark')
                    : (isDarkMode ? '#334155' : 'primary.light'),
                }
              }}
            >
              Belgeler ({documents.length})
            </Button>
          </Box>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ 
          p: 3,
          backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
          minHeight: '500px'
        }}>
          {activeTab === 'details' && (
            <Grid container spacing={3}>
              {/* Kişisel Bilgiler */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: isDarkMode ? '#3b82f6' : '#1976d2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 700,
                      mb: 3
                    }}>
                      👤 Kişisel Bilgiler
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Ad Soyad:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => handleCopyToClipboard(`${customer.firstName} ${customer.lastName}`, 'Ad Soyad')}
                            sx={{ color: isDarkMode ? '#64748b' : '#9ca3af' }}
                          >
                            <FileCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Doğum Tarihi:
                        </Typography>
                        <Typography variant="body1" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                          {formatDate(customer.birthDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          TC Kimlik:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.tcIdentity}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => handleCopyToClipboard(customer.tcIdentity, 'TC Kimlik')}
                            sx={{ color: isDarkMode ? '#64748b' : '#9ca3af' }}
                          >
                            <FileCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pasaport Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: isDarkMode ? '#3b82f6' : '#1976d2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 700,
                      mb: 3
                    }}>
                      📄 Pasaport Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Pasaport No:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.passportNo}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => handleCopyToClipboard(customer.passportNo, 'Pasaport No')}
                            sx={{ color: isDarkMode ? '#64748b' : '#9ca3af' }}
                          >
                            <FileCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Geçerlilik:
                        </Typography>
                        <Typography variant="body1" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                          {formatDate(customer.passportExpiryDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* İletişim Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: isDarkMode ? '#3b82f6' : '#1976d2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 700,
                      mb: 3
                    }}>
                      📞 İletişim Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Telefon:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.phone}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={() => handleCopyToClipboard(customer.phone, 'Telefon')}
                            sx={{ color: isDarkMode ? '#64748b' : '#9ca3af' }}
                          >
                            <FileCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          E-posta:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.email || 'Belirtilmemiş'}
                          </Typography>
                          {customer.email && (
                            <IconButton 
                              size="small"
                              onClick={() => handleCopyToClipboard(customer.email, 'E-posta')}
                              sx={{ color: isDarkMode ? '#64748b' : '#9ca3af' }}
                            >
                              <FileCopy fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Vize Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: isDarkMode ? '#3b82f6' : '#1976d2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 700,
                      mb: 3
                    }}>
                      🌍 Vize Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Ülke:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">
                            {getCountryFlag(customer.country?.code)}
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.country?.name}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Vize Türü:
                        </Typography>
                        <Chip 
                          label={customer.visaType?.name}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: isDarkMode ? '#475569' : '#d1d5db',
                            color: isDarkMode ? '#f1f5f9' : '#374151'
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Ofis:
                        </Typography>
                        <Typography variant="body1" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                          {customer.office?.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          Öncelik:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={customer.priorityLevel}
                            readOnly
                            size="small"
                          />
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#cbd5e1' : '#6b7280' }}>
                            {getPriorityText(customer.priorityLevel)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notlar - Inline Editing */}
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        color: isDarkMode ? '#3b82f6' : '#1976d2', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 700
                      }}>
                        📝 Notlar
                      </Typography>
                      {!editingNotes && (
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => setEditingNotes(true)}
                          sx={{ 
                            color: isDarkMode ? '#3b82f6' : '#1976d2',
                            '&:hover': {
                              backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                            }
                          }}
                        >
                          Düzenle
                        </Button>
                      )}
                    </Box>

                    {editingNotes ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Müşteri ile ilgili özel notlar..."
                          variant="outlined"
                          sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                              '& fieldset': {
                                borderColor: isDarkMode ? '#475569' : '#d1d5db',
                              },
                              '&:hover fieldset': {
                                borderColor: isDarkMode ? '#64748b' : '#9ca3af',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: isDarkMode ? '#3b82f6' : '#1976d2',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: isDarkMode ? '#f1f5f9' : '#1f2937',
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingNotes(false);
                              setNotesValue(customer.notes || '');
                            }}
                            sx={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}
                          >
                            Vazgeç
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={async () => {
                              try {
                                // TODO: API call to update notes
                                console.log('Notlar güncelleniyor:', notesValue);
                                setEditingNotes(false);
                              } catch (error) {
                                console.error('Not güncelleme hatası:', error);
                              }
                            }}
                            sx={{
                              backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
                              '&:hover': {
                                backgroundColor: isDarkMode ? '#2563eb' : '#1565c0'
                              }
                            }}
                          >
                            💾 Kaydet
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa', 
                          p: 2, 
                          borderRadius: 1,
                          minHeight: 60,
                          fontStyle: notesValue ? 'normal' : 'italic',
                          color: notesValue 
                            ? (isDarkMode ? '#f1f5f9' : 'inherit')
                            : (isDarkMode ? '#64748b' : 'text.secondary'),
                          border: isDarkMode ? '1px solid #475569' : 'none'
                        }}
                      >
                        {notesValue || 'Henüz not eklenmemiş...'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 'documents' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  color: isDarkMode ? '#3b82f6' : '#1976d2',
                  fontWeight: 700
                }}>
                  📎 Müşteri Belgeleri
                </Typography>
                
                {/* Dosya Yükleme Butonu */}
                <Box>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        handleFileUpload(files);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="detail-file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="detail-file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUpload />}
                      size="small"
                      disabled={uploadingFile}
                      sx={{
                        backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#2563eb' : '#1565c0'
                        }
                      }}
                    >
                      {uploadingFile ? 'Yükleniyor...' : '📤 Belge Ekle'}
                    </Button>
                  </label>
                </Box>
              </Box>

              {/* Upload Progress Area */}
              {uploadingFile && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    backgroundColor: isDarkMode ? '#172554' : '#dbeafe',
                    color: isDarkMode ? '#60a5fa' : '#1e40af',
                    '& .MuiAlert-icon': {
                      color: isDarkMode ? '#60a5fa' : '#1e40af'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} sx={{ color: isDarkMode ? '#60a5fa' : '#1e40af' }} />
                    <Typography>Dosya yükleniyor...</Typography>
                  </Box>
                </Alert>
              )}

              {/* Loading State */}
              {loadingDocuments && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {!loadingDocuments && documents.length > 0 ? (
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                }}>
                  <List sx={{ p: 0 }}>
                    {documents.map((doc) => (
                      <ListItem 
                        key={doc.id} 
                        divider
                        sx={{ 
                          py: 2,
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
                            {getDocumentIcon(doc.mimeType)}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ 
                              color: isDarkMode ? '#f1f5f9' : '#1f2937',
                              fontWeight: 600
                            }}>
                              {doc.originalName}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                              </Typography>
                              <br />
                              <Chip 
                                label={
                                  doc.documentType === 'passport' ? '📄 Pasaport' :
                                  doc.documentType === 'photo' ? '📸 Fotoğraf' :
                                  doc.documentType === 'application_form' ? '📋 Başvuru Formu' :
                                  '📎 Diğer'
                                } 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  mt: 0.5,
                                  borderColor: isDarkMode ? '#475569' : '#d1d5db',
                                  color: isDarkMode ? '#f1f5f9' : '#374151'
                                }}
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Görüntüle">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewDocument(doc)}
                                sx={{ 
                                  color: isDarkMode ? '#60a5fa' : '#1976d2',
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                                  }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="İndir">
                              <IconButton 
                                size="small"
                                onClick={() => handleDownloadDocument(doc)}  // Bu satırı ekleyin
                                sx={{ 
                                  color: isDarkMode ? '#22c55e' : '#059669',
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                                  }
                                }}
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteDocument(doc)}
                                sx={{ 
                                  color: isDarkMode ? '#ef4444' : '#dc2626',
                                  '&:hover': {
                                    backgroundColor: isDarkMode ? '#1e293b' : '#fef2f2'
                                  }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              ) : (
                <Alert 
                  severity="info"
                  sx={{ 
                    backgroundColor: isDarkMode ? '#172554' : '#dbeafe',
                    color: isDarkMode ? '#60a5fa' : '#1e40af',
                    '& .MuiAlert-icon': {
                      color: isDarkMode ? '#60a5fa' : '#1e40af'
                    }
                  }}
                >
                  📎 Bu müşteriye ait belge bulunmamaktadır. Yukarıdaki "Belge Ekle" butonunu kullanarak dosya yükleyebilirsiniz.
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 'appointment' && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ 
                color: isDarkMode ? '#3b82f6' : '#1976d2', 
                mb: 3,
                fontWeight: 700
              }}>
                📅 Randevu & Maliyet Yönetimi
              </Typography>

              <Grid container spacing={3}>
                {/* Randevu Bilgileri */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                    border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          color: isDarkMode ? '#3b82f6' : '#1976d2', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          fontWeight: 700
                        }}>
                          🕐 Randevu Bilgileri
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => setAppointmentDialogOpen(true)} // 👈 burayı güncelledik
                            sx={{ 
                                color: isDarkMode ? '#3b82f6' : '#1976d2',
                                '&:hover': {
                                backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                                }
                            }}
                        >
                            Düzenle
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            Randevu Tarihi:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.appointmentDate ? 
                              new Date(customer.appointmentDate).toLocaleDateString('tr-TR') : 
                              'Henüz planlanmadı'
                            }
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            Randevu Saati:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.appointmentDate ? 
                              new Date(customer.appointmentDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 
                              '-'
                            }
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            Durum:
                          </Typography>
                          <Chip
                            label={
                              customer.appointmentStatus === 'pending' ? '⏳ Beklemede' :
                              customer.appointmentStatus === 'confirmed' ? '✅ Onaylandı' :
                              customer.appointmentStatus === 'completed' ? '🎉 Tamamlandı' :
                              customer.appointmentStatus === 'cancelled' ? '❌ İptal' :
                              'Belirsiz'
                            }
                            color={
                              customer.appointmentStatus === 'confirmed' ? 'success' :
                              customer.appointmentStatus === 'completed' ? 'info' :
                              customer.appointmentStatus === 'cancelled' ? 'error' :
                              'warning'
                            }
                            size="small"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            Evrak Durumu:
                          </Typography>
                          <Chip
                            label={customer.documentsComplete ? '✅ Tamamlandı' : '⚠️ Eksik'}
                            color={customer.documentsComplete ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>

                        {/* Randevu Yaklaşıyor Uyarısı */}
                        {customer.appointmentDate && !customer.documentsComplete && (
                          <Alert 
                            severity="warning" 
                            sx={{ 
                              mt: 2,
                              backgroundColor: isDarkMode ? '#422006' : '#fef3c7',
                              color: isDarkMode ? '#fbbf24' : '#92400e',
                              '& .MuiAlert-icon': {
                                color: isDarkMode ? '#fbbf24' : '#92400e'
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ⚠️ Dikkat: Randevu yaklaşıyor!
                            </Typography>
                            <Typography variant="body2">
                              Evraklar henüz tamamlanmadı. Lütfen müşteriyle iletişime geçin.
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Vize Süresi */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 3,
                    backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                    border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          color: isDarkMode ? '#3b82f6' : '#1976d2', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          fontWeight: 700
                        }}>
                          ⏰ Vize Süre Takibi
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => setVisaDialogOpen(true)}
                            sx={{ 
                                color: isDarkMode ? '#3b82f6' : '#1976d2',
                                '&:hover': {
                                backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                                }
                            }}
                        >
                            Düzenle
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            Mevcut Vize Bitiş:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}>
                            {customer.visaExpiryDate ? 
                              new Date(customer.visaExpiryDate).toLocaleDateString('tr-TR') : 
                              'Belirtilmemiş'
                            }
                          </Typography>
                        </Box>

                        {customer.visaExpiryDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                              Kalan Süre:
                            </Typography>
                            <Chip
                              label={(() => {
                                const today = new Date();
                                const expiry = new Date(customer.visaExpiryDate);
                                const diffTime = expiry - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays < 0) return `${Math.abs(diffDays)} gün geçti`;
                                if (diffDays === 0) return 'Bugün bitiyor';
                                if (diffDays <= 7) return `${diffDays} gün kaldı`;
                                if (diffDays <= 30) return `${diffDays} gün kaldı`;
                                return `${diffDays} gün kaldı`;
                              })()}
                              color={(() => {
                                const today = new Date();
                                const expiry = new Date(customer.visaExpiryDate);
                                const diffTime = expiry - today;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays <= 0) return 'error';
                                if (diffDays <= 7) return 'error';
                                if (diffDays <= 30) return 'warning';
                                return 'success';
                              })()}
                              size="small"
                            />
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Maliyet Bilgileri */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 3,
                    backgroundColor: isDarkMode ? '#334155' : '#ffffff',
                    border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ 
                          color: isDarkMode ? '#3b82f6' : '#1976d2', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          fontWeight: 700
                        }}>
                          💰 Maliyet & Ödeme Takibi
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => setCostDialogOpen(true)}
                            sx={{ 
                                color: isDarkMode ? '#3b82f6' : '#1976d2',
                                '&:hover': {
                                backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6'
                                }
                            }}
                        >
                            Düzenle
                        </Button>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: isDarkMode ? '#1e40af' : '#e3f2fd',
                            borderRadius: 2,
                            border: isDarkMode ? '1px solid #1e40af' : 'none'
                          }}>
                            <Typography variant="h4" sx={{ 
                              color: isDarkMode ? '#dbeafe' : '#1976d2',
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              ₺{parseFloat(customer.totalCost || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#bfdbfe' : '#1976d2' }}>
                              Toplam Tutar
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: isDarkMode ? '#166534' : '#e8f5e8',
                            borderRadius: 2,
                            border: isDarkMode ? '1px solid #166534' : 'none'
                          }}>
                            <Typography variant="h4" sx={{ 
                              color: isDarkMode ? '#dcfce7' : '#2e7d32',
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              ₺{parseFloat(customer.paidAmount || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#bbf7d0' : '#2e7d32' }}>
                              Ödenen
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: parseFloat(customer.remainingAmount || 0) > 0 
                              ? (isDarkMode ? '#991b1b' : '#ffebee')
                              : (isDarkMode ? '#166534' : '#e8f5e8'),
                            borderRadius: 2,
                            border: parseFloat(customer.remainingAmount || 0) > 0 
                              ? (isDarkMode ? '1px solid #991b1b' : 'none')
                              : (isDarkMode ? '1px solid #166534' : 'none')
                          }}>
                            <Typography variant="h4" sx={{ 
                              color: parseFloat(customer.remainingAmount || 0) > 0 
                                ? (isDarkMode ? '#fecaca' : '#d32f2f')
                                : (isDarkMode ? '#dcfce7' : '#2e7d32'),
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              ₺{parseFloat(customer.remainingAmount || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: parseFloat(customer.remainingAmount || 0) > 0 
                                ? (isDarkMode ? '#fca5a5' : '#d32f2f')
                                : (isDarkMode ? '#bbf7d0' : '#2e7d32')
                            }}>
                              Kalan
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Paper sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: isDarkMode ? '#ea580c' : '#fff3e0',
                            borderRadius: 2,
                            border: isDarkMode ? '1px solid #ea580c' : 'none'
                          }}>
                            <Typography variant="h4" sx={{ 
                              color: isDarkMode ? '#fed7aa' : '#f57c00',
                              fontWeight: 'bold',
                              mb: 1
                            }}>
                              {customer.totalCost > 0 ? 
                                `%${Math.round((parseFloat(customer.paidAmount || 0) / parseFloat(customer.totalCost)) * 100)}` : 
                                '%0'
                              }
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#fdba74' : '#f57c00' }}>
                              Ödeme Oranı
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Ödeme Durumu Uyarısı */}
                      {parseFloat(customer.remainingAmount || 0) > 0 && (
                        <Alert 
                          severity="warning" 
                          sx={{ 
                            mt: 3,
                            backgroundColor: isDarkMode ? '#422006' : '#fef3c7',
                            color: isDarkMode ? '#fbbf24' : '#92400e',
                            '& .MuiAlert-icon': {
                              color: isDarkMode ? '#fbbf24' : '#92400e'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            💰 Ödeme Hatırlatması
                          </Typography>
                          <Typography variant="body2">
                            Müşterinin ₺{parseFloat(customer.remainingAmount).toLocaleString()} tutarında ödenmemiş borcu bulunmaktadır.
                          </Typography>
                        </Alert>
                      )}

                      {parseFloat(customer.remainingAmount || 0) === 0 && customer.totalCost > 0 && (
                        <Alert 
                          severity="success" 
                          sx={{ 
                            mt: 3,
                            backgroundColor: isDarkMode ? '#0f2418' : '#e8f5e8',
                            color: isDarkMode ? '#22c55e' : '#2e7d32',
                            '& .MuiAlert-icon': {
                              color: isDarkMode ? '#22c55e' : '#2e7d32'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ✅ Ödeme Tamamlandı
                          </Typography>
                          <Typography variant="body2">
                            Müşteri tüm ödemesini tamamlamıştır.
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        gap: 1, 
        backgroundColor: isDarkMode ? '#0f172a' : '#f5f5f5',
        borderTop: `1px solid ${isDarkMode ? '#334155' : '#e0e0e0'}`
      }}>
        <Button
          onClick={onClose}
          startIcon={<Close />}
          sx={{ 
            color: isDarkMode ? '#94a3b8' : 'inherit',
            '&:hover': {
              backgroundColor: isDarkMode ? '#1e293b' : 'action.hover'
            }
          }}
        >
          Kapat
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={() => onEdit(customer)}
          variant="contained"
          startIcon={<Edit />}
          sx={{
            backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
            '&:hover': {
              backgroundColor: isDarkMode ? '#2563eb' : '#1565c0'
            }
          }}
        >
          ✏️ Düzenle
        </Button>
      </DialogActions>
      <AppointmentEditDialog
  open={appointmentDialogOpen}
  onClose={() => setAppointmentDialogOpen(false)}
  customer={customer}
  onSave={(updatedData) => {
    console.log('📝 Kaydedilen Randevu Bilgileri:', updatedData);
    // TODO: API isteği atılacak
    setAppointmentDialogOpen(false);
  }}
/>
    <VisaExpiryEditDialog
  open={visaDialogOpen}
  onClose={() => setVisaDialogOpen(false)}
  customer={customer}
  onSave={(updatedData) => {
    console.log('📆 Yeni Vize Tarihi:', updatedData);
    // TODO: API'ye bağlanacak
    setVisaDialogOpen(false);
  }}
/>
    <CostEditDialog
  open={costDialogOpen}
  onClose={() => setCostDialogOpen(false)}
  customer={customer}
  onSave={(updatedData) => {
    console.log('💸 Yeni Maliyet Bilgileri:', updatedData);
    // TODO: API güncelleme işlemi yapılacak
    setCostDialogOpen(false);
  }}
/>
{/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Dialog>
  );
};

export default CustomerDetailDialog;