import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import Info from './Info';
import History from './History';
import Preferences from './Preferences';

function ProfilePage() {
  return (
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ 
          minWidth: 'max-content', 
          borderRight: '1px solid #ddd', 
          backgroundColor: '#fff', 
          padding: '16px' 
        }}>
          <List component="nav">
            <ListItem 
              button 
              component={Link} 
              to="/profile/info"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText primary="Info" sx={{ fontWeight: 'bold' }} />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/profile/history"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText primary="History" sx={{ fontWeight: 'bold' }} />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/profile/preferences"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText primary="Preferences" sx={{ fontWeight: 'bold' }} />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to= "info" />} />
            <Route path="info" element={<Info />} />
            <Route path="history" element={<History />} />
            <Route path="preferences" element={<Preferences />} />
          </Routes>
        </Box>
      </Box>
  );
}

export default ProfilePage;