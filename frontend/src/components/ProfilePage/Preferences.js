import React, { useEffect, useState } from "react";
import { Typography, Box, Button, TextField, Stack } from "@mui/material";
import "./Info.css";

function Preferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/profile/preferences", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch preferences");
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
      const response = await fetch("/api/profile/preferencesupdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Typography variant="h4" className="title">Preferences</Typography>

      {isEditing ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <TextField
            label="Search Range"
            name="search_range"
            value={editData.search_range || ""}
            onChange={handleInputChange}
            className="detail"
            placeholder="Enter Search Range (feet)"
            fullWidth
          />
          <TextField
            label="Price Range"
            name="price_range"
            value={editData.price_range || ""}
            onChange={handleInputChange}
            className="detail"
            placeholder="Enter Price Range ($)"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            className="button"
          >
            Save
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <Typography
            variant="body1"
            className="info-detail"
            sx={{
              textAlign: 'center',
              color: preferences?.search_range ? 'text.primary' : 'text.secondary',
            }}
          >
            Search Range: {preferences?.search_range ? `${preferences.search_range} feet` : 'Not Set'}
          </Typography>
          <Typography
            variant="body1"
            className="info-detail"
            sx={{
              textAlign: 'center',
              color: preferences?.price_range ? 'text.primary' : 'text.secondary',
            }}
          >
            Price Range: {preferences?.price_range ? `$${preferences.price_range}` : 'Not Set'}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleEditToggle}
            className="info-button"
          >
            Edit
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Preferences;
