import React, { useEffect, useState } from "react";
import WelcomeModal from "./WelcomeModal";
import RouteEstimatorWithFields from "./RouteEstimatorWithFields";

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
        <RouteEstimatorWithFields />
    </>
  );
};

export default HomePage;
