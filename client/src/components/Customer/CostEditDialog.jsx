import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';

const CostEditDialog = ({ open, onClose, customer, onSave }) => {
  const [totalCost, setTotalCost] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  useEffect(() => {
    if (customer) {
      setTotalCost(customer.totalCost || '');
      setPaidAmount(customer.paidAmount || '');
    }
  }, [customer]);

  const handleSave = () => {
    const parsedTotal = parseFloat(totalCost);
    const parsedPaid = parseFloat(paidAmount);
    const remaining = Math.max(0, parsedTotal - parsedPaid);

    onSave({
      totalCost: parsedTotal,
      paidAmount: parsedPaid,
      remainingAmount: remaining
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>💰 Maliyet & Ödeme Bilgilerini Düzenle</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Toplam Tutar (₺)"
              type="number"
              fullWidth
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ödenen Miktar (₺)"
              type="number"
              fullWidth
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>İptal</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isNaN(totalCost) || isNaN(paidAmount)}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostEditDialog;
