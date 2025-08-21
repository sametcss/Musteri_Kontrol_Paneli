// client/src/components/Common/Toast.jsx
import React from 'react';
import { Snackbar, Alert, AlertTitle, Slide } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

const SlideTransition = (props) => <Slide {...props} direction="down" />;

const Toast = ({ open, onClose, type = 'success', title, message, duration = 4000 }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <CheckCircle />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'success';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={getColor()}
        variant="filled"
        iconMapping={{ [getColor()]: getIcon() }}
        sx={{
          minWidth: 300,
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;