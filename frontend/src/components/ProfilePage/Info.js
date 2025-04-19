import React, { useEffect, useState } from "react";
import { Typography, Box, Button, TextField, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Info.css";
import avatar from "../../assets/avatar.png";

function Info() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [homeAddressSuggestions, setHomeAddressSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/profile/info", {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });

        console.log("Response:", response); // Debug and show entire response in console

        if (!response.ok) {
          throw new Error("Failed to fetch user information");
        }

        const data = await response.json();
        console.log("Data:", data); // Debug and show entire response data in console
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user info:", err);
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

    if (name === "home_address") {
      fetchAddressSuggestions(value);
    } else {
      setHomeAddressSuggestions([]);
    }
  };

  const fetchAddressSuggestions = async (input) => {
    if (input.length < 3) {
      setHomeAddressSuggestions([]);
      return;
    }
    try {
      const url = `http://127.0.0.1:8000/autocomplete?input=${encodeURIComponent(input)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.predictions) {
        setHomeAddressSuggestions(data.predictions);
      } else {
        setHomeAddressSuggestions([]);
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
      setHomeAddressSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setEditData({ ...editData, home_address: suggestion.description });
    setHomeAddressSuggestions([]);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/profile/infoupdate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      const updatedData = await response.json();
      setUserInfo({
        ...userInfo,
        ...updatedData,
        email: userInfo.email,
        username: userInfo.username
      });
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4, // Increased consistent spacing between major sections
      }}
    >
      <img
        src={avatar}
        alt="User Avatar"
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
        }}
      />

      {isEditing ? (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <TextField
            label="First Name"
            name="first_name"
            value={editData.first_name || ""}
            onChange={handleInputChange}
            className="detail"
            placeholder="Enter First Name"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={editData.last_name || ""}
            onChange={handleInputChange}
            className="detail"
            placeholder="Enter Last Name"
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: userInfo.first_name ? "text.primary" : "text.secondary",
              }}
            >
              {userInfo.first_name || userInfo.username}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: userInfo.last_name ? "text.primary" : "text.secondary",
              }}
            >
              {userInfo.last_name}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            {userInfo.email}
          </Typography>
        </Box>
      )}

      {isEditing ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
            maxWidth: "400px"
          }}
        >
          <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
            <TextField
              label="Home Address"
              name="home_address"
              value={editData.home_address || ""}
              onChange={handleInputChange}
              className="detail"
              placeholder="Enter Home Address"
              fullWidth
              onBlur={() => {
                  setTimeout(() => setHomeAddressSuggestions([]), 200);
              }}
            />
            {homeAddressSuggestions.length > 0 && (
               <Paper sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1001,
                  mt: 0.5,
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                {homeAddressSuggestions.map((suggestion) => (
                  <Box
                    key={suggestion.place_id}
                    sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Typography>{suggestion.description}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          <Typography
            variant="body1"
            className="info-detail"
            sx={{
              textAlign: "center",
              color: userInfo.home_address ? "text.primary" : "text.secondary",
            }}
          >
            {userInfo.home_address}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              px: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleEditToggle}
              className="info-button"
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Info;
