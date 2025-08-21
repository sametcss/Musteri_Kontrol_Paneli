import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Countries = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🌍 Ülkeler
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">
          Ülke yönetimi sayfası yakında gelecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Countries;