import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
} from '@mui/material';

const WelcomeModal = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <img src="/logo.png" alt="FareFinder Logo" style={{ width: '200px' }} />
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          Welcome to FareFinder!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" gutterBottom>
            We're excited to have you here!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            FareFinder is your one-stop-shop for finding the best ride prices across multiple services and nearby locations.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Input destination and pickup locations to begin
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={onClose}
            sx={{ 
              minWidth: 200,
              borderRadius: 2,
            }}
          >
            Get Started
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;