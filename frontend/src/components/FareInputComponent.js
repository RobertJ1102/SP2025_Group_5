import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { setKey, fromAddress, fromLatLng } from "react-geocode";

// Set your Google API key for geocoding
setKey("AIzaSyDW7FcjHO4DUj7wVzVSGXGOCcNpEDVrovY");

const FareInputComponent = () => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState({ lat: null, lng: null });
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationCoordinates, setDestinationCoordinates] = useState({ lat: null, lng: null });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill pickup address using browser geolocation and reverse geocode
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPickupCoordinates({ lat: latitude, lng: longitude });
          try {
            const response = await fromLatLng(latitude, longitude);
            if (response.results && response.results[0]) {
              setPickupAddress(response.results[0].formatted_address);
            }
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to retrieve current location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Handler for the "Get Pricing" button
  const handleGetPricing = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      // Geocode the destination address to get its coordinates
      const destResponse = await fromAddress(destinationAddress);
      if (destResponse.results && destResponse.results[0]) {
        const { lat, lng } = destResponse.results[0].geometry.location;
        setDestinationCoordinates({ lat, lng });

        // Construct the query string for the API call
        const queryParams = new URLSearchParams({
          start_lat: pickupCoordinates.lat,
          start_lon: pickupCoordinates.lng,
          end_lat: lat,
          end_lon: lng,
        });

        const apiResponse = await fetch(`http://127.0.0.1:8000/uber/best-uber-fare/?${queryParams.toString()}`);

        if (!apiResponse.ok) {
          throw new Error("API call failed");
        }

        const data = await apiResponse.json();
        setResult(data);
      } else {
        throw new Error("Could not geocode destination address.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        FareFinder Input
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Pickup Location"
          variant="outlined"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
        />
        <TextField
          label="Destination Address"
          variant="outlined"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleGetPricing}
          disabled={loading || !pickupAddress || !destinationAddress}
        >
          {loading ? "Loading..." : "Get Pricing"}
        </Button>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>Best Location:</strong> {result.best_location}
            </Typography>
            <Typography variant="body1">
              <strong>Best Price:</strong> {result.best_price}
            </Typography>
            <Typography variant="body1">
              <strong>Best Ride Type:</strong> {result.best_ride_type}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FareInputComponent;
