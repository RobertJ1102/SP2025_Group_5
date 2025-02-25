import { useState, useEffect } from "react";

const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        const accuracy = position.coords.accuracy;

        // Update state of coords and accuracy
        setLocation(coords);
        setAccuracy(accuracy);

        //Post coodinate data to backend
        fetch("/api/update-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(coords),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Location updated on backend:", data);
          })
          .catch((err) => {
            console.error("Error updating backend:", err);
          });
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true }
    );

    //Clean up resources on unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, accuracy, error };
};

export default useUserLocation;
