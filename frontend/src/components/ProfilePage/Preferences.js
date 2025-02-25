import React from 'react';
import { Typography, Box } from '@mui/material';
import './Info.css';

function Preferences() {
  return (
    <Box className="container">
      <Typography variant="h4" className="title">Preferences</Typography>
      <Typography variant="body1" className="detail">This is the Preferences page.</Typography>
    </Box>
  );
}

export default Preferences;