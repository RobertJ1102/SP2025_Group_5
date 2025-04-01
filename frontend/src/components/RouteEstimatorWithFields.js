import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import MapComponent from "./MapComponent";
import useUserLocation from "../hooks/useUserLocation";
import GoogleMap from "./GoogleMap"; // Assuming you have a GoogleMap component

const RouteEstimatorWithFields = () => {
  const { location, error } = useUserLocation();
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeEstimation, setRouteEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSelection, setActiveSelection] = useState("destination");

  // When the user's location is available, prefill the pickup address using reverse geocoding via the internal API.
  useEffect(() => {
    if (location) {
      // location from useUserLocation is an array: [lng, lat]
      fetch(
        `http://127.0.0.1:8000/reverse_geocode?lat=${location[1]}&lng=${location[0]}`
      )
        .then((res) => res.json())
        .then((response) => {
          if (response.results && response.results[0]) {
            setPickupAddress(response.results[0].formatted_address);
          }
        })
        .catch((err) => console.error("Reverse geocode error:", err));
      setPickupCoordinates({ lat: location[1], lng: location[0] });
    }
  }, [location]);

  // Map callbacks (receiving [lng, lat] arrays)
  const handleSetPickup = (lonLat) => {
    setPickupCoordinates({ lat: lonLat[1], lng: lonLat[0] });
    fetch(
      `http://127.0.0.1:8000/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`
    )
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
    fetch(
      `http://127.0.0.1:8000/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.results && response.results[0]) {
          setDestinationAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  // Update coordinates when text fields are blurred by using internal geocode endpoint.
  const updatePickupFromText = () => {
    if (pickupAddress) {
      fetch(
        `http://127.0.0.1:8000/geocode?address=${encodeURIComponent(
          pickupAddress
        )}`
      )
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
      fetch(
        `http://127.0.0.1:8000/geocode?address=${encodeURIComponent(
          destinationAddress
        )}`
      )
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

  // Call internal API to estimate route.
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
      const response = await fetch(
        `http://127.0.0.1:8000/uber/best-uber-fare/?${queryParams.toString()}`
      );
      if (!response.ok) throw new Error("Failed to estimate route");
      const data = await response.json();
      setRouteEstimation(data);
    } catch (err) {
      console.error("Route estimation error:", err);
    }
    setLoading(false);
  };

  const addRouteToHistory = async () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error(
        "Both pickup and destination must be set to add to history"
      );
      return;
    }

    const addressData = {
      written_address: pickupAddress,
      final_address: destinationAddress,
      longitude_start: pickupCoordinates.lng,
      latitude_start: pickupCoordinates.lat,
      longitude_end: destinationCoordinates.lng,
      latitude_end: destinationCoordinates.lat,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/profile/history/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) throw new Error("Failed to add route to history");
      console.log("Route added to history successfully");
    } catch (err) {
      console.error("Error adding route to history:", err);
    }
  };

  const handleOpenUber = () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set to open in Uber");
      return;
    }
    // Replace these with your actual values.
    const CLIENT_ID = "bGx0iZIMpiDhwEoOIQX_CZNek5LBJoAfBej5JmEJ";
    const PRODUCT_ID = "2d1d002b-d4d0-4411-98e1-673b244878b2"; // sample product id

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
    addRouteToHistory();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Route Estimator
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Pickup Location"
            fullWidth
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            onBlur={updatePickupFromText}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Destination Location"
            fullWidth
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            onBlur={updateDestinationFromText}
          />
        </Box>
        <Box sx={{ width: "100%", height: "500px", mb: 3 }}>
          <GoogleMap
            activeSelection={activeSelection}
            onSetPickup={handleSetPickup}
            onSetDestination={handleSetDestination}
            currentLocation={
              pickupCoordinates
                ? pickupCoordinates
                : location
                ? { lat: location[1], lng: location[0] }
                : null
            }
            pickupPoint={pickupCoordinates}
            destinationPoint={destinationCoordinates}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 3 }}>
          <Button
            variant={activeSelection === "pickup" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("pickup")}
          >
            Set Pickup by Map
          </Button>
          <Button
            variant={
              activeSelection === "destination" ? "contained" : "outlined"
            }
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
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleOpenUberAndAddHistory}
          >
            Open in Uber
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RouteEstimatorWithFields;
