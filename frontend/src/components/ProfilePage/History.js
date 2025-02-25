import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import './Info.css';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/profile/history', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box className="container">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="container">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="container">
      <Typography variant="h4" className="title">History</Typography>
      {history.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="body1" className="detail">
            Address: {item.address}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Date: {formatDate(item.timestamp)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default History;