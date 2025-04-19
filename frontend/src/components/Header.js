import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Header({ onLogout }) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1976d2",
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <img
            src={logo}
            alt="FareFinder Logo"
            style={{
              height: "40px",
              marginRight: "10px",
            }}
          />
        </Box>
        <Button
          color="inherit"
          onClick={handleHomeClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          onClick={handleProfileClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Profile
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          color="inherit"
          onClick={onLogout}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
