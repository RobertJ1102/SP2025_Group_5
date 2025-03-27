import React, { useEffect, useState } from "react";
import { Typography, Box, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Info.css";
import avatar from "../../assets/avatar.png";

function Info() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
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
            {userInfo.first_name || "First Name"}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: userInfo.last_name ? "text.primary" : "text.secondary",
            }}
          >
            {userInfo.last_name || "Last Name"}
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
          }}
        >
          <TextField
            label="Home Address"
            name="home_address"
            value={editData.home_address || ""}
            onChange={handleInputChange}
            className="detail"
            placeholder="Enter Home Address"
            fullWidth
            sx={{ maxWidth: "400px" }}
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
            {userInfo.home_address || "Home Address"}
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
