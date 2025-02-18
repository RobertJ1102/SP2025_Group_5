import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Alert, Paper } from "@mui/material";

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
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => (window.location.href = "/"), 1000);
      } else {
        const errorDetail = data.detail || "Login failed";
        setError(typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail));
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Login successful!</Alert>}
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
              sx={{ backgroundColor: "white" }}
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
              sx={{ backgroundColor: "white" }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 2 }}
            >
              Login
            </Button>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => (window.location.href = "/forgot-password")}
              >
                Forgot Password?
              </Button>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => (window.location.href = "/register")}
              >
                Create Account
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
