import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ⚙️ Ayarlar
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">
          Ayarlar sayfası yakında gelecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;