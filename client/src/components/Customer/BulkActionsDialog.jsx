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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Warning,
  Delete,
  Email,
  FileDownload,
  Cancel,
  Send,
  Person
} from '@mui/icons-material';
import { customersAPI } from '../../services/api';

const BulkActionsDialog = ({ 
  open, 
  onClose, 
  customers, 
  action, // 'delete', 'email', 'export'
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');

  if (!customers || customers.length === 0) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Toplu Müşteri Silme',
          icon: <Delete />,
          color: '#d32f2f',
          description: `${customers.length} müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?`,
          warning: 'Bu işlem geri alınamaz! Tüm müşteri bilgileri kalıcı olarak silinecektir.'
        };
      case 'email':
        return {
          title: 'Toplu E-posta Gönderimi',
          icon: <Email />,
          color: '#1976d2',
          description: `${customers.length} müşteriye e-posta gönderin`,
          warning: 'E-posta adresi olmayan müşteriler atlanacaktır.'
        };
      case 'export':
        return {
          title: 'Toplu Dışa Aktarma',
          icon: <FileDownload />,
          color: '#2e7d32',
          description: `${customers.length} müşteri bilgisini dışa aktarın`,
          warning: 'Tüm müşteri bilgileri seçilen formatta indirilecektir.'
        };
      default:
        return {};
    }
  };

  const config = getActionConfig();

  const handleAction = async () => {
    setLoading(true);
    setError('');

    try {
      switch (action) {
        case 'delete':
          await handleBulkDelete();
          break;
        case 'email':
          await handleBulkEmail();
          break;
        case 'export':
          await handleBulkExport();
          break;
        default:
          break;
      }
      onSuccess(action, customers.length);
      onClose();
    } catch (error) {
      console.error('Bulk işlem hatası:', error);
      setError(`İşlem sırasında hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const promises = customers.map(customer => 
      customersAPI.delete(customer.id)
    );
    await Promise.all(promises);
  };

  const handleBulkEmail = async () => {
    // TODO: Bulk email API endpoint'i
    console.log('Bulk email gönderiliyor:', {
      customers: customers.map(c => c.email).filter(Boolean),
      subject: emailSubject,
      message: emailMessage
    });
    // Simüle edilmiş gecikme
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleBulkExport = async () => {
    // TODO: Export functionality
    console.log('Export işlemi:', { customers, format: exportFormat });
    // Simüle edilmiş gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ backgroundColor: config.color, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {config.icon}
          <Typography variant="h6">
            {config.title}
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
          {config.warning}
        </Alert>

        <Typography variant="body1" gutterBottom>
          {config.description}
        </Typography>

        {/* E-posta özel alanları */}
        {action === 'email' && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <TextField
              fullWidth
              label="E-posta Konusu"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mesaj"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder="Müşterilerinize göndermek istediğiniz mesajı yazın..."
              required
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              E-posta adresi olan {customers.filter(c => c.email).length} müşteriye gönderilecek
            </Typography>
          </Box>
        )}

        {/* Export özel alanları */}
        {action === 'export' && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Dosya Formatı</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Dosya Formatı"
              >
                <MenuItem value="excel">📊 Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">📄 CSV (.csv)</MenuItem>
                <MenuItem value="pdf">📑 PDF (.pdf)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Seçili müşteriler listesi */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Seçili Müşteriler ({customers.length})
          </Typography>
          
          <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {customers.map((customer) => (
              <ListItem key={customer.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {customer.firstName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={`${customer.firstName} ${customer.lastName}`}
                    secondary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip 
                            label={getCountryFlag(customer.country?.code) + ' ' + customer.country?.name}
                            size="small"
                            variant="outlined"
                        />
                        <Chip 
                            label={customer.visaType?.name}
                            size="small"
                            variant="outlined"
                        />
                        {action === 'email' && !customer.email && (
                            <Chip 
                            label="E-posta yok"
                            size="small"
                            color="warning"
                            />
                        )}
                        </Box>
                    }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          startIcon={<Cancel />}
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          onClick={handleAction}
          variant="contained"
          sx={{ backgroundColor: config.color }}
          startIcon={action === 'email' ? <Send /> : config.icon}
          disabled={loading || (action === 'email' && (!emailSubject || !emailMessage))}
        >
          {loading ? 'İşleniyor...' : (
            action === 'delete' ? 'Sil' :
            action === 'email' ? 'Gönder' :
            action === 'export' ? 'İndir' : 'Uygula'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkActionsDialog;