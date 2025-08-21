import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📊 Raporlar
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">
          Raporlar sayfası yakında gelecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reports;