import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, logout } from "./services/auth";
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import HomePage from "./components/HomePage";
import { Container, Typography } from "@mui/material";
import ChangePasswordPage from "./components/ChangePasswordPage";
import Header from "./components/Header";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import HelpPage from "./components/HelpPage";
import { TextField, Button, Box, Alert, Paper } from "@mui/material";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (window.location.hostname === "localhost") {
    window.location.replace(
      `http://127.0.0.1:${window.location.port}${window.location.pathname}${window.location.search}`
    );
  }

  return (
    <>
      <Box sx={{ paddingTop: "64px", width: "100%", overflowX: "hidden" }}>
        {user ? (
          <>
            <Header onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/profile/*" element={<ProfilePage />} />
              <Route path="/help" element={<HelpPage />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<CreateAccountPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        )}
      </Box>
    </>
  );
}

export default App;
