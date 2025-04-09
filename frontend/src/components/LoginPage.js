import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Alert, Paper } from "@mui/material";
import "../styles/AuthPages.css";
import logo from "../assets/logo.png";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);

        // Check if user just registered
        const isNewUser = localStorage.getItem("newlyRegistered");
        if (isNewUser) {
          // Remove the flag so it doesn't show again
          localStorage.removeItem("newlyRegistered");
          // Set a flag for HomePage to show welcome message
          sessionStorage.setItem("showWelcome", "true");
        }

        window.location.href = "/";
      } else {
        const errorDetail = data.detail || "Login failed";
        setError(typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail));
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <Box className="auth-container">
      <Container maxWidth="xs">
        <Paper elevation={3} className="auth-paper">
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ mb: 3 }}>
              <img src={logo} alt="FareFinder Logo" style={{ maxWidth: "200px", height: "auto" }} />
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Login successful!
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                type="text"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Login
              </Button>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                <Button variant="text" color="primary" onClick={() => (window.location.href = "/forgot-password")}>
                  Forgot Password?
                </Button>
                <Button variant="text" color="primary" onClick={() => (window.location.href = "/register")}>
                  Create Account
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
