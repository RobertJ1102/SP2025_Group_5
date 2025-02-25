import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import MapComponent from "./MapComponent";
import FareInputComponent from "./FareInputComponent";

const HomePage = () => {
  return (
    <>
      {/* Full-Screen Background Map */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      >
        <MapComponent />
      </Box>

      {/* Content Container */}
      <Container
        maxWidth="xs"
        sx={{
          position: "absolute",
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
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to FareFinder
          </Typography>
          <Typography variant="body1">Find the best nearby pickup location for your Uber ride.</Typography>
          {/* Fare Input Component */}
          <Box sx={{ marginTop: 2 }}>
            <FareInputComponent />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default HomePage;
