import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import GoogleMap from "./GoogleMap";
import useUserLocation from "../hooks/useUserLocation";

const RouteEstimatorTwoColumn = () => {
  const { location, error } = useUserLocation(); // location is [lng, lat]
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeEstimation, setRouteEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  // "activeSelection" controls whether a map click will update pickup or destination.
  const [activeSelection, setActiveSelection] = useState("auto");

  // Prefill the pickup info once location is available
  useEffect(() => {
    if (location && !pickupCoordinates) {
      const lat = location[1];
      const lng = location[0];
      setPickupCoordinates({ lat, lng });
      fetch(`http://127.0.0.1:8000/reverse_geocode?lat=${lat}&lng=${lng}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.results && response.results[0]) {
            setPickupAddress(response.results[0].formatted_address);
          }
        })
        .catch((err) => console.error("Reverse geocode error:", err));
    }
  }, [location, pickupCoordinates]);

  const handleSetPickup = (lonLat) => {
    setPickupCoordinates({ lat: lonLat[1], lng: lonLat[0] });
    fetch(`http://127.0.0.1:8000/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.results && response.results[0]) {
          setPickupAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  const handleSetDestination = (lonLat) => {
    setDestinationCoordinates({ lat: lonLat[1], lng: lonLat[0] });
    fetch(`http://127.0.0.1:8000/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.results && response.results[0]) {
          setDestinationAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  const updatePickupFromText = () => {
    if (pickupAddress) {
      fetch(`http://127.0.0.1:8000/geocode?address=${encodeURIComponent(pickupAddress)}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.results && response.results[0]) {
            const loc = response.results[0].geometry.location;
            setPickupCoordinates({ lat: loc.lat, lng: loc.lng });
          }
        })
        .catch((err) => console.error("Geocode pickup error:", err));
    }
  };

  const updateDestinationFromText = () => {
    if (destinationAddress) {
      fetch(`http://127.0.0.1:8000/geocode?address=${encodeURIComponent(destinationAddress)}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.results && response.results[0]) {
            const loc = response.results[0].geometry.location;
            setDestinationCoordinates({ lat: loc.lat, lng: loc.lng });
          }
        })
        .catch((err) => console.error("Geocode destination error:", err));
    }
  };

  const estimateRoute = async () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set");
      return;
    }
    setLoading(true);
    setRouteEstimation(null);
    const queryParams = new URLSearchParams({
      start_lat: pickupCoordinates.lat,
      start_lon: pickupCoordinates.lng,
      end_lat: destinationCoordinates.lat,
      end_lon: destinationCoordinates.lng,
    });
    try {
      const response = await fetch(`http://127.0.0.1:8000/uber/best-uber-fare/?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to estimate route");
      const data = await response.json();
      setRouteEstimation(data);
    } catch (err) {
      console.error("Route estimation error:", err);
    }
    setLoading(false);
  };

  const handleOpenUber = () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set to open in Uber");
      return;
    }
    const CLIENT_ID = "bGx0iZIMpiDhwEoOIQX_CZNek5LBJoAfBej5JmEJ";
    const PRODUCT_ID = "2d1d002b-d4d0-4411-98e1-673b244878b2";
    const pickupData = {
      latitude: pickupCoordinates.lat,
      longitude: pickupCoordinates.lng,
      addressLine1: pickupAddress,
      addressLine2: "",
    };
    const dropData = {
      latitude: destinationCoordinates.lat,
      longitude: destinationCoordinates.lng,
      addressLine1: destinationAddress,
      addressLine2: "",
    };
    const uberDeepLink =
      `https://m.uber.com/looking?client_id=${CLIENT_ID}` +
      `&pickup=${encodeURIComponent(JSON.stringify(pickupData))}` +
      `&drop[0]=${encodeURIComponent(JSON.stringify(dropData))}` +
      `&product_id=${PRODUCT_ID}`;
    window.open(uberDeepLink, "_blank");
  };

  const handleOpenUberAndAddHistory = () => {
    handleOpenUber();
    // addRouteToHistory(); // if you want to add to history
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY || "YOUR_API_KEY_HERE";

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* LEFT COLUMN: Input and Buttons */}
      <Box
        sx={{
          width: 400,
          p: 2,
          overflowY: "auto",
          borderRight: "1px solid #ccc",
          bgcolor: "white",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Route Estimator
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Pickup Location"
            fullWidth
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            onBlur={updatePickupFromText}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Destination Location"
            fullWidth
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            onBlur={updateDestinationFromText}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant={activeSelection === "pickup" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("pickup")}
            fullWidth
          >
            Set Pickup by Map
          </Button>
          <Button
            variant={activeSelection === "destination" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("destination")}
            fullWidth
          >
            Set Destination by Map
          </Button>
        </Box>
        <Button variant="contained" fullWidth onClick={estimateRoute} sx={{ mb: 1 }}>
          Estimate Route
        </Button>
        {loading && (
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        )}
        {routeEstimation && (
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Best Location:</strong> {routeEstimation.best_location}
            </Typography>
            <Typography>
              <strong>Best Price:</strong> {routeEstimation.best_price}
            </Typography>
            <Typography>
              <strong>Best Ride Type:</strong> {routeEstimation.best_ride_type}
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" fullWidth onClick={handleOpenUberAndAddHistory}>
            Open in Uber
          </Button>
        </Box>
      </Box>

      {/* RIGHT COLUMN: Map */}
      <Box sx={{ flexGrow: 1 }}>
        <GoogleMap
          activeSelection={activeSelection}
          onSetPickup={handleSetPickup}
          onSetDestination={handleSetDestination}
          currentLocation={
            pickupCoordinates ? pickupCoordinates : location ? { lat: location[1], lng: location[0] } : null
          }
          pickupPoint={pickupCoordinates}
          destinationPoint={destinationCoordinates}
        />
      </Box>
    </Box>
  );
};

export default RouteEstimatorTwoColumn;
