import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import MapComponent from "./MapComponent";

const HomePage = () => {
  return (
    <>
      {/* Full-Screen Background Map */}
      <Box
        sx={{
          position: "fixed", // Fixed ensures it stays full-screen
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0, // Keeps it interactive but behind the content
        }}
      >
        <MapComponent />
      </Box>

      {/* Content Container */}
      <Container
        maxWidth="xs"
        sx={{
          position: "absolute ",
          zIndex: 1,
          color: "white",
          bottom: 20,
          right: 20,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            marginTop: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent background for readability
            backdropFilter: "blur(5px)",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to FareFinder
          </Typography>
          <Typography variant="body1">
            This application helps you find the best nearby location to book an
            Uber ride by comparing fares within a 400ft radius.
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
    </>
  );
};

export default HomePage;
