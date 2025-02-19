import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import './Info.css';

function Info() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/profile/info', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });

        console.log('Response:', response); // Debug and show entire response in console

        if (!response.ok) {
          throw new Error('Failed to fetch user information');
        }

        const data = await response.json();
        console.log('Data:', data); // Debug and show entire response data in console
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditData(userInfo);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/profile/infoupdate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user information');
      }

      const updatedData = await response.json();
      setUserInfo(updatedData);
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
    <Box className="info-container">
      <Typography variant="h4" className="info-title">User Information</Typography>
      {isEditing ? (
        <div className="text-field-container">
          <TextField
            label="First Name"
            name="first_name"
            value={editData.first_name}
            onChange={handleInputChange}
            className="info-detail"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={editData.last_name}
            onChange={handleInputChange}
            className="info-detail"
          />
          <TextField
            label="Home Address"
            name="home_address"
            value={editData.home_address}
            onChange={handleInputChange}
            className="info-detail"
          />
          <Button variant="contained" color="primary" onClick={handleSave} className="info-button">
            Save
          </Button>
        </div>
      ) : (
        <>
          <Typography variant="body1" className="info-detail">First Name: {userInfo.first_name}</Typography>
          <Typography variant="body1" className="info-detail">Last Name: {userInfo.last_name}</Typography>
          <Typography variant="body1" className="info-detail">Home Address: {userInfo.home_address}</Typography>
          <Button variant="outlined" onClick={handleEditToggle} className="info-button">
            Edit
          </Button>
        </>
      )}
    </Box>
  );
}

export default Info;