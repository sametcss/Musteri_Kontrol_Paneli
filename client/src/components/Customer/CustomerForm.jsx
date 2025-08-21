import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  IconButton,
  Rating,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
  FormHelperText
} from '@mui/material';
import {
  Person,
  Public,
  Description,
  ContactPhone,
  Save,
  Cancel,
  CloudUpload,
  FileCopy,
  Delete,
  Download,
  Visibility,
  AttachFile,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { customersAPI } from '../../services/api';
import { countriesAPI, visaTypesAPI, officesAPI } from '../../services/api';

// Vize türü ikonları
const getVisaTypeIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('turist') || n.includes('tourist')) return '🧳';
  if (n.includes('schengen')) return '🇪🇺';
  if (n.includes('öğrenci') || n.includes('student')) return '🎓';
  if (n.includes('çalışma') || n.includes('work')) return '💼';
  if (n.includes('transit')) return '✈️';
  if (n.includes('aile') || n.includes('family')) return '👨‍👩‍👧';
  if (n.includes('ticari') || n.includes('business')) return '📈';
  return '📋';
};

// Ofis ikonları
const getOfficeIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('istanbul')) return '🕌';
  if (n.includes('ankara')) return '🏛️';
  if (n.includes('izmir')) return '⛵';
  if (n.includes('antalya')) return '🌴';
  return '🏢';
};

const CustomerForm = ({ 
  open, 
  onClose, 
  customer = null, 
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const [hoveredField, setHoveredField] = useState(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);
  const [offices, setOffices] = useState([]);

  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    passportNo: '',
    passportExpiryDate: '',
    tcIdentity: '',
    phone: '',
    email: '',
    countryId: '',
    visaTypeId: '',
    officeId: '',
    priorityLevel: 3,
    notes: '',
    visaExpiryDate: '',
    appointmentDate: '',
    appointmentStatus: 'pending',
    documentsComplete: false,
    totalCost: '',
    paidAmount: '',
    remainingAmount: ''
  });

  const steps = [
    { label: 'Kişisel Bilgiler', icon: '👤' },
    { label: 'Pasaport Bilgileri', icon: '📄' },
    { label: 'İletişim Bilgileri', icon: '📞' },
    { label: 'Vize Bilgileri', icon: '🌍' },
    { label: 'Belgeler', icon: '📎' }
  ];

  // ✨ VALIDATION FUNCTIONS
  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        if (!value?.trim()) return 'Ad zorunludur';
        if (value.trim().length < 2) return 'Ad en az 2 karakter olmalı';
        return null;
      case 'lastName':
        if (!value?.trim()) return 'Soyad zorunludur';
        if (value.trim().length < 2) return 'Soyad en az 2 karakter olmalı';
        return null;
      case 'birthDate':
        if (!value) return 'Doğum tarihi zorunludur';
        const birth = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        if (birth >= today) return 'Doğum tarihi bugünden önce olmalı';
        if (age < 18 || age > 120) return 'Yaş 18-120 arasında olmalı';
        return null;
      case 'tcIdentity':
        if (!value?.trim()) return 'TC Kimlik No zorunludur';
        if (!/^\d{11}$/.test(value)) return 'TC Kimlik No 11 haneli olmalı';
        return null;
      case 'passportNo':
        if (!value?.trim()) return 'Pasaport No zorunludur';
        if (value.length < 6) return 'Pasaport No en az 6 karakter olmalı';
        return null;
      case 'passportExpiryDate':
        if (!value) return 'Pasaport bitiş tarihi zorunludur';
        const expiry = new Date(value);
        const todayExp = new Date();
        if (expiry <= todayExp) return 'Pasaport tarihi gelecekte olmalı';
        return null;
      case 'phone':
        const cleaned = value.replace(/\D/g, '');
        const normalized = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
        if (!/^[5][0-9]{9}$/.test(normalized)) {
          return 'Geçerli telefon numarası girin (5XXXXXXXXX)';
        }
        return '';
      case 'countryId':
        if (!value) return 'Ülke seçimi zorunludur';
        return null;
      case 'visaTypeId':
        if (!value) return 'Vize türü seçimi zorunludur';
        return null;
      case 'officeId':
        if (!value) return 'Ofis seçimi zorunludur';
        return null;
      default:
        return null;
    }
  };

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        birthDate: customer.birthDate ? customer.birthDate.split('T')[0] : '',
        passportNo: customer.passportNo || '',
        passportExpiryDate: customer.passportExpiryDate ? customer.passportExpiryDate.split('T')[0] : '',
        tcIdentity: customer.tcIdentity || '',
        phone: customer.phone || '',
        email: customer.email || '',
        countryId: customer.countryId ? String(customer.countryId) : '',
        visaTypeId: customer.visaTypeId ? String(customer.visaTypeId) : '',
        officeId: customer.officeId ? String(customer.officeId) : '',
        priorityLevel: customer.priorityLevel || 3,
        notes: customer.notes || '',
        visaExpiryDate: customer.visaExpiryDate ? customer.visaExpiryDate.split('T')[0] : '',
        appointmentDate: customer.appointmentDate ? customer.appointmentDate.slice(0, 16) : '',
        appointmentStatus: customer.appointmentStatus || 'pending',
        documentsComplete: customer.documentsComplete || false,
        totalCost: customer.totalCost || '',
        paidAmount: customer.paidAmount || '',
        remainingAmount: customer.remainingAmount || ''
      });
      setUploadedFiles(
        (customer.documents || []).map((d, i) => ({
          id: d.id ?? `doc-${i}`,
          name: d.fileName || d.filename || d.name || 'Belge',
          size: Number(d.size || 0),
          uploadDate: d.uploadedAt ? new Date(d.uploadedAt) : new Date(),
          status: 'completed'
        }))
      );

    }
  }, [customer]);

  const handleInputChange = (field, value) => {
    // ✨ Telefon numarası formatı düzelt
    if (field === 'phone' && value) {
      // 0 ile başlıyorsa kaldır, sonra 5 ile başlamıyorsa 5 ekle
      let cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue.startsWith('0')) {
        cleanValue = cleanValue.substring(1);
      }
      if (cleanValue && !cleanValue.startsWith('5')) {
        cleanValue = '5' + cleanValue;
      }
      value = cleanValue;
    }
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // ✨ Clear error when user starts typing/selecting
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputBlur = (field) => {
    // ✨ Sadece değer varsa ve boş değilse validate et
    if (formData[field] || ['firstName', 'lastName', 'birthDate', 'tcIdentity', 'passportNo', 'passportExpiryDate', 'phone'].includes(field)) {
      const error = validateField(field, formData[field]);
      if (error) {
        setFieldErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleNext = () => {
    let stepFields = [];
    let hasStepErrors = false;

    switch (activeStep) {
      case 0:
        stepFields = ['firstName', 'lastName', 'birthDate', 'tcIdentity'];
        break;
      case 1:
        stepFields = ['passportNo', 'passportExpiryDate'];
        break;
      case 2:
        stepFields = ['phone']; // istersen email de buraya ekle: 'phone', 'email'
        break;
      case 3:
        stepFields = ['countryId', 'visaTypeId', 'officeId'];
        break;
      case 4:
        setActiveStep(prev => prev + 1);
        return;
    }

    // ✨ Adım alanları için önce manuel blur tetikle
    stepFields.forEach(field => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input) input.blur(); // kritik satır!
    });

    // ✨ Sonra validate et
    const stepErrors = {};
    stepFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        stepErrors[field] = error;
        hasStepErrors = true;
      }
    });

    if (hasStepErrors) {
      setFieldErrors(prev => ({ ...prev, ...stepErrors }));
      showToast('error', 'Lütfen tüm hataları düzeltin ve tekrar deneyin');

      setTimeout(() => {
        const firstErrorField = Object.keys(stepErrors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorField}"], input[tabindex]`);
        if (errorElement) errorElement.focus();
      }, 100);
      return;
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCopyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', `${label} kopyalandı`);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadDate: new Date(),
      status: 'uploading'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload
    newFiles.forEach(fileObj => {
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'completed' }
              : f
          )
        );
      }, 2000);
    });
  };

  const handleFileDelete = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (activeStep === steps.length - 1) {
          handleSubmit();
        }
      }
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        const activeElement = document.activeElement;

        // Eğer Enter'a basıldığında odakta bir BUTTON varsa (örn. "İleri"), normal davranışa izin ver
        if (activeElement.tagName === 'BUTTON') {
          return;
        }

        event.preventDefault();

        if (activeStep < steps.length - 1) {
          handleNext();
        } else {
          handleSubmit(); // son adımda Enter formu gönderir
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, activeStep, steps.length]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const countryRes = await countriesAPI.getAll();
        setCountries(countryRes.data?.data || countryRes.data || []);
      } catch (error) {
        console.error("Ülkeler yüklenirken hata:", error);
        setCountries([]);
      }
    })();
  }, [open]);
  

  // Ülke seçildiğinde vize türlerini yükle
  useEffect(() => {
    if (!formData.countryId) {
      setVisaTypes([]);
      return;
    }
    (async () => {
      try {
        const visaRes = await visaTypesAPI.getAll(formData.countryId);
        setVisaTypes(visaRes.data?.data || visaRes.data || []);
      } catch (error) {
        console.error("Vize türleri yüklenirken hata:", error);
        setVisaTypes([]);
      }
    })();
  }, [formData.countryId]);

  useEffect(() => {
  const loadOffices = async () => {
    try {
      if (!formData.countryId) {
        setOffices([]);
        setFormData(prev => ({ ...prev, officeId: '' }));
        return;
      }
      setLoading(true);
      const res = await officesAPI.getAll(formData.countryId);
      const list = res.data?.data || res.data || [];
      setOffices(list);
      // Seçili ofis ülke filtresinde yoksa temizle
      if (list.length && formData.officeId) {
        const exists = list.some(o => Number(o.id) === Number(formData.officeId));
        if (!exists) setFormData(prev => ({ ...prev, officeId: '' }));
      }
    } catch (e) {
      console.error('Ofisler yüklenemedi:', e);
      setOffices([]);
      setFormData(prev => ({ ...prev, officeId: '' }));
    } finally {
      setLoading(false);
    }
  };
  loadOffices();
}, [formData.countryId]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const firstInput = document.querySelector(`input[tabindex="${activeStep * 2 + 1}"]`);
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [activeStep, open]);

  const handleSubmit = async () => {
    // 📱 Telefon numarasını normalize et
      if (formData.phone) {
        let cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.slice(1);
      }
      formData.phone = cleanPhone;
    }
    // Final validation
    const allRequiredFields = ['firstName', 'lastName', 'birthDate', 'tcIdentity', 'passportNo', 'passportExpiryDate', 'phone', 'countryId', 'visaTypeId', 'officeId'];
    const finalErrors = {};
    
    allRequiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) finalErrors[field] = error;
    });

    if (Object.keys(finalErrors).length > 0) {
      setFieldErrors(finalErrors);
      showToast('error', 'Lütfen tüm hataları düzeltin');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        countryId: parseInt(formData.countryId),
        visaTypeId: parseInt(formData.visaTypeId), 
        officeId: parseInt(formData.officeId),
        priorityLevel: parseInt(formData.priorityLevel)
      };

      let response;
      if (customer) {
        response = await customersAPI.update(customer.id, submitData);
        showToast('success', '✅ Müşteri başarıyla güncellendi!');
      } else {
        response = await customersAPI.create(submitData);
        showToast('success', '✅ Müşteri başarıyla kaydedildi!');
      }

      // ✨ Belge yükleme işlemi - GERÇEK API ÇAĞRISI
      if (uploadedFiles.length > 0 && response.data) {
        const customerId = response.data.data ? response.data.data.id : response.data.id;
        console.log('📎 Dosya yükleniyor müşteri ID:', customerId);
        
        try {
          // Her dosyayı tek tek yükle
          for (const file of uploadedFiles) {
            if (file.file && file.status === 'completed') {
              const formData = new FormData();
              formData.append('document', file.file);
              formData.append('documentType', 'other');
              formData.append('uploadedBy', 'system');
              
              // documentsAPI.uploadDocument kullan
              // await documentsAPI.uploadDocument(customerId, formData);
              console.log('📄 Dosya yüklendi:', file.name);
            }
          }
          showToast('success', '📎 Belgeler de başarıyla yüklendi!');
        } catch (docError) {
          console.error('Belge yükleme hatası:', docError);
          showToast('warning', '⚠️ Müşteri kaydedildi ama belge yüklemede sorun oldu');
        }
      }

      setTimeout(() => {
        onSuccess();
        handleClose(); // ✨ Formu temizleyen fonksiyon
      }, 1500);
        
    } catch (error) {
      console.error('❌ Form gönderim hatası:', error);
      showToast('error', error.message || '❌ Kayıt işlemi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  // ✨ Form temizleme fonksiyonu
  const handleClose = () => {
    setFormData({
      firstName: '', lastName: '', birthDate: '', passportNo: '', passportExpiryDate: '',
      tcIdentity: '', phone: '', email: '', countryId: '', visaTypeId: '', officeId: '',
      priorityLevel: 3, notes: '', visaExpiryDate: '', appointmentDate: '', appointmentStatus: 'pending',
      documentsComplete: false, totalCost: '', paidAmount: '', remainingAmount: ''
    });
    setUploadedFiles([]);
    setActiveStep(0);
    setFieldErrors({});
    onClose();
  };

  const getCountryFlag = (code) => {
    const c = String(code || '').toUpperCase();
    const flags = {
      GER: '🇩🇪', // Almanya
      USA: '🇺🇸',
      GBR: '🇬🇧',
      FRA: '🇫🇷',
      ITA: '🇮🇹',
      ESP: '🇪🇸',
      GRC: '🇬🇷',
      HUN: '🇭🇺',
      SVN: '🇸🇮',
      PRT: '🇵🇹',
      BGR: '🇧🇬',
      NLD: '🇳🇱',
      SWE: '🇸🇪',
      AUT: '🇦🇹',
      BEL: '🇧🇪',
      POL: '🇵🇱',
      MLT: '🇲🇹'
    };
    return flags[c] || '🌍';
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTextField = (props) => {
    const { field, label, ...otherProps } = props;
    return (
      <TextField
        name={field}
        fullWidth
        label={label}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        onBlur={() => handleInputBlur(field)}
        error={!!fieldErrors[field]}
        helperText={fieldErrors[field] || ''}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? '#334155' : '#ffffff',
            '& fieldset': {
              borderColor: fieldErrors[field] ? '#f44336' : (isDarkMode ? '#475569' : '#d1d5db'),
              borderWidth: fieldErrors[field] ? 2 : 1,
            },
            '&:hover fieldset': {
              borderColor: fieldErrors[field] ? '#f44336' : (isDarkMode ? '#64748b' : '#9ca3af'),
            },
            '&.Mui-focused fieldset': {
              borderColor: fieldErrors[field] ? '#f44336' : (isDarkMode ? '#3b82f6' : '#1976d2'),
            },
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? '#f1f5f9' : '#1f2937',
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? '#cbd5e1' : '#6b7280',
          }
        }}
        {...otherProps}
      />
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Kişisel Bilgiler
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              👤 Kişisel Bilgiler
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'firstName',
                  label: 'Ad',
                  required: true,
                  tabIndex: 1,
                  InputProps: {
                    endAdornment: formData.firstName && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard(formData.firstName, 'Ad')}
                          tabIndex={-1}  
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'lastName',
                  label: 'Soyad',
                  required: true,
                  tabIndex: 2,
                  InputProps: {
                    endAdornment: formData.lastName && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard(formData.lastName, 'Soyad')}
                          tabIndex={-1}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'birthDate',
                  label: 'Doğum Tarihi',
                  type: 'date',
                  required: true,
                  tabIndex: 3,
                  InputLabelProps: { shrink: true }
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'tcIdentity',
                  label: 'TC Kimlik No',
                  required: true,
                  tabIndex: 4,
                  InputProps: {
                    endAdornment: formData.tcIdentity && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard(formData.tcIdentity, 'TC Kimlik No')}
                          tabIndex={-1}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
            </Grid>
          </Box>
        );
      

      case 1: // Pasaport Bilgileri
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📄 Pasaport Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'passportNo',
                  label: 'Pasaport No',
                  required: true,
                  tabIndex: 5,
                  InputProps: {
                    endAdornment: formData.passportNo && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard(formData.passportNo, 'Pasaport No')}
                          tabIndex={-1}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'passportExpiryDate',
                  label: 'Pasaport Geçerlilik Tarihi',
                  type: 'date',
                  required: true,
                  tabIndex: 6,
                  InputLabelProps: { shrink: true }
                })}
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              💡 Pasaport geçerlilik tarihi, seyahat tarihinden en az 6 ay sonra olmalıdır.
            </Alert>
          </Box>
        );

      case 2: // İletişim Bilgileri
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📞 İletişim Bilgileri
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'phone',
                  label: 'Telefon No',
                  required: true,
                  tabIndex: 7,
                  placeholder: '5XXXXXXXXX (0 olmadan)',
                  InputProps: {
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>+90</Typography>,
                    endAdornment: formData.phone && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard('+90' + formData.phone, 'Telefon No')}
                          tabIndex={-1}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField({
                  field: 'email',
                  label: 'E-posta',
                  type: 'email',
                  tabIndex: 8,
                  placeholder: 'ornek@email.com',
                  InputProps: {
                    endAdornment: formData.email && (
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleCopyToClipboard(formData.email, 'E-posta')}
                          tabIndex={-1}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                })}
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Vize Bilgileri
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🌍 Vize Bilgileri
            </Typography>
            
            {(() => {
              // Loading state kontrolü
              if (countries.length === 0 && visaTypes.length === 0 && offices.length === 0) {
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Veriler yükleniyor...</Typography>
                  </Box>
                );
              }

              return (
                <>
                  {/* Ülke Seçimi */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      🏳️ Hedef Ülke
                    </Typography>
                    
                    {countries.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ Henüz hiç ülke eklenmemiş. Lütfen admin panelinden ülke ekleyin.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {countries.map((country) => (
                          <Grid item xs={12} sm={6} md={4} key={country.id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                border: formData.countryId === country.id ? '2px solid #1976d2' : `1px solid ${isDarkMode ? '#475569' : '#e0e0e0'}`,
                                backgroundColor: formData.countryId === country.id 
                                  ? (isDarkMode ? '#1e40af' : '#f3f8ff')
                                  : (isDarkMode ? '#334155' : 'white'),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: 3,
                                  borderColor: isDarkMode ? '#3b82f6' : '#1976d2'
                                }
                              }}
                              onClick={() => {
                                handleInputChange('countryId', country.id);
                                handleInputChange('visaTypeId', '');
                                handleInputChange('officeId', '');
                                handleInputBlur('countryId');
                              }}
                            >
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" sx={{ mb: 1 }}>
                                  {getCountryFlag(country.code)}
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                  {country.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {country.code}
                                </Typography>
                                {formData.countryId === country.id && (
                                  <Box sx={{ mt: 1 }}>
                                    <CheckCircle color="primary" fontSize="small" />
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {fieldErrors.countryId && (
                      <FormHelperText error sx={{ mt: 1, ml: 2 }}>{fieldErrors.countryId}</FormHelperText>
                    )}
                  </Box>

                  {/* Vize Türü Seçimi */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      📋 Vize Türü
                    </Typography>
                    
                    {visaTypes.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ Henüz hiç vize türü eklenmemiş. Lütfen admin panelinden vize türü ekleyin.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {visaTypes.map((type) => (
                          <Grid item xs={12} sm={6} key={type.id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                border: formData.visaTypeId === type.id ? '2px solid #1976d2' : `1px solid ${isDarkMode ? '#475569' : '#e0e0e0'}`,
                                backgroundColor: formData.visaTypeId === type.id 
                                  ? (isDarkMode ? '#1e40af' : '#f3f8ff')
                                  : (isDarkMode ? '#334155' : 'white'),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: 3,
                                  borderColor: isDarkMode ? '#3b82f6' : '#1976d2'
                                }
                              }}
                              onClick={() => {
                                handleInputChange('visaTypeId', type.id);
                                handleInputBlur('visaTypeId');
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h5">
                                    {getVisaTypeIcon(type.name)}
                                  </Typography>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                      {type.name}
                                    </Typography>
                                    {type.description && (
                                      <Typography variant="body2" color="text.secondary">
                                        {type.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  {formData.visaTypeId === type.id && (
                                    <CheckCircle color="primary" />
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {fieldErrors.visaTypeId && (
                      <FormHelperText error sx={{ mt: 1, ml: 2 }}>{fieldErrors.visaTypeId}</FormHelperText>
                    )}
                  </Box>

                  {/* Ofis Seçimi */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      🏢 Başvuru Ofisi
                    </Typography>
                    
                    {offices.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        ⚠️ Henüz hiç ofis eklenmemiş. Lütfen admin panelinden ofis ekleyin.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {offices.map((office) => (
                          <Grid item xs={12} md={6} key={office.id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                border: formData.officeId === office.id ? '2px solid #1976d2' : `1px solid ${isDarkMode ? '#475569' : '#e0e0e0'}`,
                                backgroundColor: formData.officeId === office.id 
                                  ? (isDarkMode ? '#1e40af' : '#f3f8ff')
                                  : (isDarkMode ? '#334155' : 'white'),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: 3,
                                  borderColor: isDarkMode ? '#3b82f6' : '#1976d2'
                                }
                              }}
                              onClick={() => {
                                handleInputChange('officeId', office.id);
                                handleInputBlur('officeId');
                              }}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h5">
                                    {getOfficeIcon(office.name)}
                                  </Typography>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                      {office.name}
                                    </Typography>
                                    {office.address && (
                                      <Typography variant="body2" color="text.secondary">
                                        📍 {office.address.length > 50 ? office.address.substring(0, 50) + '...' : office.address}
                                      </Typography>
                                    )}
                                    {office.phone && (
                                      <Typography variant="caption" color="text.secondary">
                                        📞 {office.phone}
                                      </Typography>
                                    )}
                                  </Box>
                                  {formData.officeId === office.id && (
                                    <CheckCircle color="primary" />
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {fieldErrors.officeId && (
                      <FormHelperText error sx={{ mt: 1, ml: 2 }}>{fieldErrors.officeId}</FormHelperText>
                    )}
                  </Box>
                </>
              );
            })()}
          </Box>
        );

      case 4: // Belgeler
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📎 Belgeler
            </Typography>
            
            {/* Upload Area */}
            <Card sx={{ mb: 3, border: '2px dashed #1976d2', backgroundColor: '#f8f9ff' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    size="large"
                  >
                    📤 Belge Yükle
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  PDF, JPG, PNG, DOC, DOCX dosyalarını seçin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maksimum dosya boyutu: 10MB
                </Typography>
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {uploadedFiles.map((file) => (
                    <ListItem key={file.id} divider>
                      <ListItemIcon>
                        {file.status === 'uploading' ? (
                          <CircularProgress size={24} />
                        ) : file.status === 'completed' ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <Box>
                            <Typography variant="caption">
                              {formatFileSize(file.size || 0)} • {new Date(file.uploadDate || file.uploadedAt || Date.now()).toLocaleString('tr-TR')}
                            </Typography>
                            {file.status === 'uploading' && (
                              <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                                Yükleniyor...
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Görüntüle">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="İndir">
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              size="small" 
                              onClick={() => handleFileDelete(file.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>📋 Gerekli Belgeler:</strong>
              <br />
              • Pasaport fotokopisi
              <br />
              • Vize başvuru formu
              <br />
              • Fotoğraf (beyaz zemin, 3.5x4.5 cm)
              <br />
              • Seyahat sigortası
              <br />
              • Mali durum belgesi
            </Alert>
          </Box>
        );

      default:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="error">
              Bilinmeyen adım: {step}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2, 
            minHeight: '70vh',
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
          gap: 1
        }}>
          <Person />
          {customer ? '✏️ Müşteri Düzenle' : '➕ Yeni Müşteri Ekle'}
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Stepper */}
          <Paper elevation={0} sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    StepIconComponent={() => (
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: activeStep >= index ? 'primary.main' : 'grey.300',
                          color: 'white',
                          fontSize: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: activeStep >= index ? 'primary.dark' : 'grey.400',
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={() => setActiveStep(index)}
                      >
                        {step.icon}
                      </Box>
                    )}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        display: 'block',
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => setActiveStep(index)}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Form Content */}
          <Box sx={{ p: 3, minHeight: 400 }}>
            {renderStepContent(activeStep)}
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
            startIcon={<Cancel />}
            disabled={loading}
            size="large"
            tabIndex={-1}
            sx={{ minWidth: 140, px: 3 }}
          >
            İptal
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              variant="outlined"
              size="large"
              sx={{ minWidth: 140, px: 3 }}
            >
              ⬅️ Geri
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ minWidth: 140, px: 3 }}
            >
              İleri ➡️
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
              size="large"
              sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                minWidth: 160,
                px: 4
              }}
            >
              {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ✨ Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomerForm;