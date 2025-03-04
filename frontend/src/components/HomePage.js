import React from "react";
import { Container, Typography, Paper } from "@mui/material";
import RouteEstimatorWithFields from "./RouteEstimatorWithFields";

const HomePage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          FareFinder
        </Typography>
        <RouteEstimatorWithFields />
      </Paper>
    </Container>
  );
};

export default HomePage;
