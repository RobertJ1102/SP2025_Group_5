import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Box, Alert, Paper } from "@mui/material";
import "../styles/AuthPages.css";
import logo from "../assets/logo.png";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("A new password has been sent to your email.");
      } else {
        setError(data.detail || "Failed to reset password.");
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
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <form onSubmit={handleReset}>
              <TextField
                label="Enter your email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Reset Password
              </Button>
              <Button variant="outlined" color="primary" fullWidth sx={{ mt: 1 }} onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPasswordPage;
