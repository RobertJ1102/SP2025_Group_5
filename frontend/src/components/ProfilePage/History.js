import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
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
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" className="title">History</Typography>
      {history.map((item, index) => (
        <Stack key={index} spacing={1}>
          <Typography variant="body1" className="detail">
            Address: {item.address}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Date: {formatDate(item.timestamp)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default History;