import React, { useEffect, useState, useCallback } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import useUserLocation from "../hooks/useUserLocation";

const RouteEstimatorOverlay = () => {
  const { location, error } = useUserLocation(); // location is [lng, lat]
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeEstimation, setRouteEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSelection, setActiveSelection] = useState("pickup");

  // Prefill pickup location from user's current location
  useEffect(() => {
    if (location && !pickupCoordinates) {
      const lat = location[1];
      const lng = location[0];
      setPickupCoordinates({ lat, lng });
      fetch(`http://127.0.0.1:8000/reverse_geocode?lat=${lat}&lng=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results[0]) {
            setPickupAddress(data.results[0].formatted_address);
          }
        })
        .catch((err) => console.error("Reverse geocode error:", err));
    }
  }, [location, pickupCoordinates]);

  // Reverse geocode helper
  const reverseGeocodeAndSetAddress = useCallback((lat, lng, setAddressFn) => {
    fetch(`http://127.0.0.1:8000/reverse_geocode?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          setAddressFn(data.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  }, []);

  // Handle clicks on the map
  const handleMapClick = useCallback(
    (ev) => {
      // Safety check to avoid "Cannot read properties of undefined" errors
      if (!ev || !ev.latLng) {
        console.warn("Map click event is missing latLng property:", ev);
        return;
      }
      const lat = ev.latLng.lat();
      const lng = ev.latLng.lng();

      if (activeSelection === "pickup") {
        setPickupCoordinates({ lat, lng });
        reverseGeocodeAndSetAddress(lat, lng, setPickupAddress);
      } else {
        setDestinationCoordinates({ lat, lng });
        reverseGeocodeAndSetAddress(lat, lng, setDestinationAddress);
      }
    },
    [activeSelection, reverseGeocodeAndSetAddress]
  );

  // Geocode the typed pickup address
  const updatePickupFromText = useCallback(() => {
    if (!pickupAddress) return;
    fetch(`http://127.0.0.1:8000/geocode?address=${encodeURIComponent(pickupAddress)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const loc = data.results[0].geometry.location;
          setPickupCoordinates({ lat: loc.lat, lng: loc.lng });
        }
      })
      .catch((err) => console.error("Geocode pickup error:", err));
  }, [pickupAddress]);

  // Geocode the typed destination address
  const updateDestinationFromText = useCallback(() => {
    if (!destinationAddress) return;
    fetch(`http://127.0.0.1:8000/geocode?address=${encodeURIComponent(destinationAddress)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const loc = data.results[0].geometry.location;
          setDestinationCoordinates({ lat: loc.lat, lng: loc.lng });
        }
      })
      .catch((err) => console.error("Geocode destination error:", err));
  }, [destinationAddress]);

  // Estimate route via /uber/best-uber-fare
  const estimateRoute = async () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set.");
      return;
    }
    setLoading(true);
    setRouteEstimation(null);

    const params = new URLSearchParams({
      start_lat: pickupCoordinates.lat,
      start_lon: pickupCoordinates.lng,
      end_lat: destinationCoordinates.lat,
      end_lon: destinationCoordinates.lng,
    });
    try {
      const res = await fetch(`http://127.0.0.1:8000/uber/best-uber-fare/?${params}`);
      if (!res.ok) throw new Error("Failed to estimate route");
      const data = await res.json();
      setRouteEstimation(data);
    } catch (err) {
      console.error("Route estimation error:", err);
    }
    setLoading(false);
  };

  // Open the ride in Uber
  const handleOpenUber = () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set to open in Uber.");
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

  // (Optional) Add the route to history
  const addRouteToHistory = async () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set to add to history.");
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
      const res = await fetch("http://127.0.0.1:8000/profile/history/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressData),
      });
      if (!res.ok) throw new Error("Failed to add route to history");
      console.log("Route added to history successfully");
    } catch (err) {
      console.error("Error adding route to history:", err);
    }
  };

  const handleOpenUberAndAddHistory = () => {
    handleOpenUber();
    addRouteToHistory();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY || "YOUR_API_KEY_HERE";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Full-screen Map */}
      <APIProvider apiKey={MAP_API_KEY}>
        <Map
          defaultZoom={14}
          defaultCenter={
            pickupCoordinates
              ? pickupCoordinates
              : location
              ? { lat: location[1], lng: location[0] }
              : { lat: 40.7128, lng: -74.006 }
          }
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          {pickupCoordinates && <Marker position={pickupCoordinates} options={{ title: "Pickup Location" }} />}
          {destinationCoordinates && (
            <Marker position={destinationCoordinates} options={{ title: "Destination Location" }} />
          )}
        </Map>
      </APIProvider>

      {/* Floating Card in top-left corner */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          width: 360,
          bgcolor: "white",
          p: 2,
          borderRadius: 1,
          boxShadow: 3,
          zIndex: 1000,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Route Estimator
        </Typography>
        <TextField
          label="Pickup Location"
          variant="outlined"
          fullWidth
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          onBlur={updatePickupFromText}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Destination Location"
          variant="outlined"
          fullWidth
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          onBlur={updateDestinationFromText}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Button
            variant={activeSelection === "pickup" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("pickup")}
            fullWidth
          >
            Set Pickup
          </Button>
          <Button
            variant={activeSelection === "destination" ? "contained" : "outlined"}
            onClick={() => setActiveSelection("destination")}
            fullWidth
          >
            Set Destination
          </Button>
        </Box>
        <Button variant="contained" onClick={estimateRoute} fullWidth sx={{ mb: 1 }}>
          Estimate Route
        </Button>
        {loading && <Typography align="center">Estimating...</Typography>}
        {routeEstimation && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Best Location:</strong> {routeEstimation.best_location}
            </Typography>
            <Typography variant="body2">
              <strong>Best Price:</strong> {routeEstimation.best_price}
            </Typography>
            <Typography variant="body2">
              <strong>Best Ride Type:</strong> {routeEstimation.best_ride_type}
            </Typography>
          </Box>
        )}
        <Button variant="contained" onClick={handleOpenUberAndAddHistory} fullWidth sx={{ mt: 2 }}>
          Open in Uber
        </Button>
      </Box>
    </Box>
  );
};

export default RouteEstimatorOverlay;
