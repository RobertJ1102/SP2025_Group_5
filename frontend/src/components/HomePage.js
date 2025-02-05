import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";

function HomePage() {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to FareFinder
        </Typography>
        <Typography variant="body1">
          This application helps you find the best nearby location to book an Uber ride by comparing fares within a
          400ft radius.
        </Typography>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">🚗 Features Coming Soon:</Typography>
          <ul>
            <li>Check fare estimates for different pickup points</li>
            <li>Compare Uber and Lyft prices dynamically</li>
            <li>Find the cheapest and fastest routes</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
}

export default HomePage;
