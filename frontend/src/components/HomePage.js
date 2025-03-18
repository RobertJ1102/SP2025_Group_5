import React, { useEffect, useState } from "react";
import { Container, Typography, Paper } from "@mui/material";
import RouteEstimatorWithFields from "./RouteEstimatorWithFields";
import WelcomeModal from "./WelcomeModal";

const HomePage = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const shouldShowWelcome = sessionStorage.getItem("showWelcome");
    if (shouldShowWelcome) {
      setShowWelcome(true);
      sessionStorage.removeItem("showWelcome");
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <>
      <WelcomeModal 
        open={showWelcome} 
        onClose={handleCloseWelcome} 
      />
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
    </>
  );
};

export default HomePage;