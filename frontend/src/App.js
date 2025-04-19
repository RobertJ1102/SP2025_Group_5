import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, logout } from "./services/auth";
import LoginPage from "./components/LoginPage";
import CreateAccountPage from "./components/CreateAccountPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import HomePage from "./components/HomePage";
import { Typography, Box } from "@mui/material";
import ChangePasswordPage from "./components/ChangePasswordPage";
import Header from "./components/Header";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import HelpPage from "./components/HelpPage";
import { TextField, Button, Alert, Paper, Bos } from "@mui/material";

// ProtectedRoute: Renders children only if user is logged in, otherwise navigates to login.
function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// PublicRoute: Renders children only if no user is logged in, otherwise navigates to home.
function PublicRoute({ user, children }) {
  return user ? <Navigate to="/" replace /> : children;
}

function App() {
  if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
    window.location.href = "https://" + window.location.host + window.location.pathname + window.location.search;
  }

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

  return (
    <Box sx={{ paddingTop: "64px", width: "100%", overflowX: "hidden" }}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute user={user}>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute user={user}>
              <CreateAccountPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute user={user}>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header onLogout={handleLogout} />
                <HomePage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header onLogout={handleLogout} />
                <ChangePasswordPage />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute user={user}>
              <Header onLogout={handleLogout} />
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/*"
          element={
            <ProtectedRoute user={user}>
              <>
                <Header onLogout={handleLogout} />
                <ProfilePage />
              </>
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
