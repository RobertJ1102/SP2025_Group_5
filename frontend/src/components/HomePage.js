import React, { useEffect, useState } from "react";
import WelcomeModal from "./WelcomeModal";
import RouteEstimatorWithWideMap from "./RouteEstimatorWithWideMap";

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
      {/* Render the wide map component without a constraining container */}
      <RouteEstimatorWithWideMap />
    </>
  );
};

export default HomePage;
