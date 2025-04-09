import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Alert, Paper } from "@mui/material";
import "../styles/AuthPages.css";
import logo from "../assets/logo.png";

function CreateAccountPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        localStorage.setItem("newlyRegistered", "true");
        setTimeout(() => (window.location.href = "/"), 1000);
      } else {
        setError(data.detail || "Registration failed.");
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
            {success && <Alert severity="success">Account created! You can now log in.</Alert>}
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
                label="Email"
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
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                variant="outlined"
                className="auth-textfield"
              />
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Register
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

export default CreateAccountPage;
