import React, { useState } from "react";
import { Container, TextField, Button, Typography, Alert, Paper } from "@mui/material";
import { Box } from "@mui/material";
import '../styles/AuthPages.css';

function ChangePasswordPage() {
  const [email, setEmail] = useState("");
  const [old_password, setOldPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, old_password, new_password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Your password has been changed.");
      } else {
        setError(data.detail || "Failed to reset password.");
      }
    } catch (err) {
      setError("Backend server failed to connect. Contact an administrator.");
    }
  };

  return (
    <Box className="auth-container">
      <Container maxWidth="xs" sx={{ mt: -50 }}>
        <Paper elevation={3} className="auth-paper">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Change Password
            </Typography>
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
              <TextField
                label="Enter your old password"
                type="password"
                fullWidth
                margin="normal"
                value={old_password}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <TextField
                label="Enter your new password"
                type="password"
                fullWidth
                margin="normal"
                value={new_password}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Change Password
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ChangePasswordPage;
