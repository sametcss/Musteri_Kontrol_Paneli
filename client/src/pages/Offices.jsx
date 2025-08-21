import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Offices = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🏢 Ofisler
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">
          Ofis yönetimi sayfası yakında gelecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Offices;