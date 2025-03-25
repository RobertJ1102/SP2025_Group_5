import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import Info from './Info';
import History from './History';
import Preferences from './Preferences';

function ProfilePage() {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'start',
      minHeight: '100vh', 
      padding: '128px 32px 32px 32px',
      backgroundImage: 'url(/daymap.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%'
    }}>
      <Box sx={{ 
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ 
          minWidth: 'max-content', 
          borderRight: '1px solid #ddd',
          padding: '16px' 
        }}>
          <List component="nav">
            <ListItem 
              button 
              component={Link} 
              to="/profile/info"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText 
                primary="Info" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/profile/history"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText 
                primary="History" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/profile/preferences"
              sx={{ '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              <ListItemText 
                primary="Preferences" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>
          </List>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="info" />} />
            <Route path="info" element={<Info />} />
            <Route path="history" element={<History />} />
            <Route path="preferences" element={<Preferences />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;