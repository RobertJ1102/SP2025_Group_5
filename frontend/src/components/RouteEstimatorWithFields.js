import React, { useEffect, useState } from "react";
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";
import MapComponent from "./MapComponent";
import useUserLocation from "../hooks/useUserLocation";
import { setKey, fromLatLng, fromAddress } from "react-geocode";

// Set your Google API key here.
setKey("AIzaSyC8Vrp8rhcNWAN9IJJfuZZ_5reIRaFfSU4");

const RouteEstimatorWithFields = () => {
  // Get the user's current location.
  const { location, error } = useUserLocation();

  // State for addresses and coordinates.
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeEstimation, setRouteEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  // activeSelection determines whether a map click sets the pickup or destination.
  const [activeSelection, setActiveSelection] = useState("destination");

  // When the user's location is available, reverse geocode to prefill the pickup address and set pickup coordinates.
  useEffect(() => {
    if (location) {
      fromLatLng(location[1], location[0])
        .then((response) => {
          if (response.results && response.results[0]) {
            setPickupAddress(response.results[0].formatted_address);
          }
        })
        .catch((err) => {
          console.error("Reverse geocode error:", err);
        });
      setPickupCoordinates({ lat: location[1], lng: location[0] });
    }
  }, [location]);

  // Callback when a pickup point is selected on the map.
  const handleSetPickup = (coords) => {
    setPickupCoordinates({ lat: coords[1], lng: coords[0] });
    fromLatLng(coords[1], coords[0])
      .then((response) => {
        if (response.results && response.results[0]) {
          setPickupAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  // Callback when a destination is selected on the map.
  const handleSetDestination = (coords) => {
    setDestinationCoordinates({ lat: coords[1], lng: coords[0] });
    fromLatLng(coords[1], coords[0])
      .then((response) => {
        if (response.results && response.results[0]) {
          setDestinationAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  // When the user edits the pickup text field, update its coordinates on blur.
  const updatePickupFromText = () => {
    if (pickupAddress) {
      fromAddress(pickupAddress)
        .then((response) => {
          if (response.results && response.results[0]) {
            const loc = response.results[0].geometry.location;
            setPickupCoordinates({ lat: loc.lat, lng: loc.lng });
          }
        })
        .catch((err) => console.error("Geocode pickup error:", err));
    }
  };

  // When the user edits the destination text field, update its coordinates on blur.
  const updateDestinationFromText = () => {
    if (destinationAddress) {
      fromAddress(destinationAddress)
        .then((response) => {
          if (response.results && response.results[0]) {
            const loc = response.results[0].geometry.location;
            setDestinationCoordinates({ lat: loc.lat, lng: loc.lng });
          }
        })
        .catch((err) => console.error("Geocode destination error:", err));
    }
  };

  // Estimate route by calling the internal API.
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Route Estimator
        </Typography>
        {/* Pickup and Destination Text Fields */}
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
        {/* Map Component */}
        <Box sx={{ width: "100%", height: "300px", mb: 2 }}>
          <MapComponent
            activeSelection={activeSelection}
            onSetPickup={handleSetPickup}
            onSetDestination={handleSetDestination}
          />
        </Box>
        {/* Buttons to Toggle Map Selection Mode */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
          <Button
            variant={activeSelection === "pickup" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("pickup")}
          >
            Set Pickup by Map
          </Button>
          <Button
            variant={activeSelection === "destination" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("destination")}
          >
            Set Destination by Map
          </Button>
        </Box>
        <Button variant="contained" fullWidth onClick={estimateRoute}>
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
      </Paper>
    </Container>
  );
};

export default RouteEstimatorWithFields;
