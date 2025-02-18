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
          <Typography variant="body1">Check fare estimates for different pickup points</Typography>
          <Typography variant="body1">Compare Uber and Lyft prices dynamically</Typography>
          <Typography variant="body1">Find the cheapest and fastest routes</Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default HomePage;
