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
  FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

const AppointmentEditDialog = ({ open, onClose, customer, onSave }) => {
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [documentsComplete, setDocumentsComplete] = useState(false);

  useEffect(() => {
    if (customer) {
      const date = customer.appointmentDate ? new Date(customer.appointmentDate) : null;
      setAppointmentDate(date);
      setAppointmentTime(date);
      setAppointmentStatus(customer.appointmentStatus || 'pending');
      setDocumentsComplete(customer.documentsComplete || false);
    }
  }, [customer]);

  const handleSave = () => {
    const combinedDate = new Date(appointmentDate);
    if (appointmentTime) {
      combinedDate.setHours(appointmentTime.getHours());
      combinedDate.setMinutes(appointmentTime.getMinutes());
    }

    const updatedData = {
      appointmentDate: combinedDate,
      appointmentStatus,
      documentsComplete
    };

    onSave(updatedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>🕐 Randevu Bilgilerini Düzenle</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
        <DatePicker
          label="Randevu Tarihi"
          value={appointmentDate}
          onChange={(date) => setAppointmentDate(date)}
          slotProps={{ textField: { fullWidth: true } }}
        />
        <TimePicker
          label="Randevu Saati"
          value={appointmentTime}
          onChange={(time) => setAppointmentTime(time)}
          slotProps={{ textField: { fullWidth: true } }}
        />
        <FormControl fullWidth>
          <InputLabel>Randevu Durumu</InputLabel>
          <Select
            value={appointmentStatus}
            label="Randevu Durumu"
            onChange={(e) => setAppointmentStatus(e.target.value)}
          >
            <MenuItem value="pending">⏳ Beklemede</MenuItem>
            <MenuItem value="confirmed">✅ Onaylandı</MenuItem>
            <MenuItem value="completed">🎉 Tamamlandı</MenuItem>
            <MenuItem value="cancelled">❌ İptal</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={documentsComplete}
              onChange={(e) => setDocumentsComplete(e.target.checked)}
            />
          }
          label="Evraklar Tamam mı?"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" onClick={handleSave}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentEditDialog;
