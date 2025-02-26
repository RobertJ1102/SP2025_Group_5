import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import './Info.css';

function Preferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/profile/preferences', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }

        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditData(preferences);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/profile/preferencesupdate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const updatedData = await response.json();
      setPreferences(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box className="container">
      <Typography variant="h4" className="title">Preferences</Typography>
      {isEditing ? (
        <div className="text-field-container">
          <TextField
            label="Search Range"
            name="search_range"
            value={editData.search_range}
            onChange={handleInputChange}
            className="detail"
          />
          <TextField
            label="Price Range"
            name="price_range"
            value={editData.price_range}
            onChange={handleInputChange}
            className="detail"
          />
          <Button variant="contained" color="primary" onClick={handleSave} className="button">
            Save
          </Button>
        </div>
      ) : (
        <>
          <Typography variant="body1" className="detail">Search Range: {preferences.search_range}</Typography>
          <Typography variant="body1" className="detail">Price Range: {preferences.price_range}</Typography>
          <Button variant="outlined" onClick={handleEditToggle} className="button">
            Edit
          </Button>
        </>
      )}
    </Box>
  );
}

export default Preferences;