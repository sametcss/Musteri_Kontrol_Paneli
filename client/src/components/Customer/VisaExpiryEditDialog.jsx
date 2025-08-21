import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const VisaExpiryEditDialog = ({ open, onClose, customer, onSave }) => {
  const [expiryDate, setExpiryDate] = useState(null);

  useEffect(() => {
    if (customer?.visaExpiryDate) {
      setExpiryDate(new Date(customer.visaExpiryDate));
    }
  }, [customer]);

  const handleSave = () => {
    if (!expiryDate) return;
    onSave({ visaExpiryDate: expiryDate.toISOString() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Vize Bitiş Tarihini Düzenle</DialogTitle>
      <DialogContent>
        <DatePicker
          label="Vize Bitiş Tarihi"
          value={expiryDate}
          onChange={(newDate) => setExpiryDate(newDate)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              variant: 'outlined'
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!expiryDate}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisaExpiryEditDialog;
