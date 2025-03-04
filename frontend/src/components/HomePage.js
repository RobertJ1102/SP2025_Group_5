import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import RouteEstimatorWithFields from "./RouteEstimatorWithFields";

const HomePage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          FareFinder
        </Typography>
        {/* Map Section */}
        {/* <Box sx={{ width: "100%", height: "300px", mb: 2 }}>
          <MapComponent />
        </Box> */}
        {/* Fare Input Section */}
        <RouteEstimatorWithFields />
      </Paper>
    </Container>
  );
};

export default HomePage;
