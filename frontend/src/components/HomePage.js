import React, { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import WelcomeModal from "./WelcomeModal";
import RouteEstimatorWithFields from "./RouteEstimatorWithFields";
import RouteEstimatorOverlay from "./RouteEstimatorOverlay";
import RouteEstimatorWithWideMap from "./RouteEstimatorWithWideMap";
import RouteEstimatorTwoColumn from "./two";

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
      <WelcomeModal open={showWelcome} onClose={handleCloseWelcome} />
      {/* Remove or adjust the Container and remove Paper to let the UI expand */}
      <Container maxWidth="xl" disableGutters sx={{ mt: 0, mb: 0 }}>
        <Typography variant="h4" align="center" gutterBottom>
          FareFinder
        </Typography>
        <RouteEstimatorWithFields />
      </Container>
    </>
  );
};

export default HomePage;
