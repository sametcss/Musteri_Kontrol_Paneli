import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Warning,
  Delete,
  Cancel,
  Person
} from '@mui/icons-material';
import { customersAPI } from '../../services/api';

const CustomerDeleteDialog = ({ open, onClose, customer, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!customer) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await customersAPI.delete(customer.id);
      onSuccess(customer);
      onClose();
    } catch (error) {
      console.error('Müşteri silinemedi:', error);
      setError('Müşteri silinirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#d32f2f', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning />
          <Typography variant="h6">
            Müşteri Silme Onayı
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Dikkat!</strong> Bu işlem geri alınamaz. Müşteri ve tüm ilgili bilgileri kalıcı olarak silinecektir.
        </Alert>

        <Typography variant="body1" gutterBottom>
          Aşağıdaki müşteriyi silmek istediğinizden emin misiniz?
        </Typography>

        {/* Müşteri Bilgi Kartı */}
        <Box 
          sx={{ 
            p: 2, 
            border: '1px solid #e0e0e0', 
            borderRadius: 2, 
            backgroundColor: '#f8f9fa',
            mt: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {customer.firstName} {customer.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.passportNo}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              icon={<span>{getCountryFlag(customer.country?.code)}</span>}
              label={customer.country?.name}
              size="small"
              variant="outlined"
            />
            <Chip 
              label={customer.visaType?.name}
              size="small"
              variant="outlined"
            />
            <Chip 
              label={customer.office?.name}
              size="small"
              variant="outlined"
            />
            <Chip 
              label={`${customer.priorityLevel} ⭐`}
              size="small"
              color={customer.priorityLevel >= 4 ? 'error' : 'default'}
              variant="outlined"
            />
          </Box>

          {customer.phone && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              📞 {customer.phone}
            </Typography>
          )}
          
          {customer.email && (
            <Typography variant="body2">
              📧 {customer.email}
            </Typography>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Bu müşteriye ait tüm veriler (kişisel bilgiler, notlar, ek hizmetler) kalıcı olarak silinecektir.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          startIcon={<Cancel />}
          disabled={loading}
          variant="outlined"
        >
          İptal
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          startIcon={<Delete />}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDeleteDialog;