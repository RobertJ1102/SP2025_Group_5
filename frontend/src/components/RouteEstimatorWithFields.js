import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert, Select, IconButton } from "@mui/material";
import GoogleMap from "./GoogleMap";
import useUserLocation from "../hooks/useUserLocation";

const RouteEstimatorWithFields = () => {
  const { location, error } = useUserLocation();
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [fareOptions, setFareOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSelection, setActiveSelection] = useState("auto");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddressNickname, setNewAddressNickname] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [userPreferences, setUserPreferences] = useState(null);
  const [errorToast, setErrorToast] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [optionPoints, setOptionPoints] = useState([]);

  // Prefill pickup coordinates and address when location is available
  useEffect(() => {
    if (location && !pickupCoordinates) {
      fetch(`/api/reverse_geocode?lat=${location[1]}&lng=${location[0]}`)
        .then((res) => res.json())
        .then((response) => {
          if (response.results && response.results[0]) {
            setPickupAddress(response.results[0].formatted_address);
          }
        })
        .catch((err) => console.error("Reverse geocode error:", err));
      setPickupCoordinates({ lat: location[1], lng: location[0] });
    }
  }, [location, pickupCoordinates]);

  // Map callbacks (receiving [lng, lat] arrays)
  const handleSetPickup = (lonLat) => {
    setPickupCoordinates({ lat: lonLat[1], lng: lonLat[0] });
    fetch(`/api/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`)
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
    fetch(`/api/reverse_geocode?lat=${lonLat[1]}&lng=${lonLat[0]}`)
      .then((res) => res.json())
      .then((response) => {
        if (response.results && response.results[0]) {
          setDestinationAddress(response.results[0].formatted_address);
        }
      })
      .catch((err) => console.error("Reverse geocode error:", err));
  };

  // Update coordinates from text input using internal geocoding API.
  const updatePickupFromText = () => {
    if (pickupAddress) {
      fetch(`/api/geocode?address=${encodeURIComponent(pickupAddress)}`)
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
      fetch(`/api/geocode?address=${encodeURIComponent(destinationAddress)}`)
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

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/profile/preferences", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserPreferences(data);
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
      }
    };
    fetchPreferences();
  }, []);

  // Estimate route via internal API
  const estimateRoute = async () => {
    setErrorToast("");

    if (!pickupCoordinates || !destinationCoordinates) {
      setErrorToast("Pickup and destination must be set!");
      console.error("Both pickup and destination must be set");
      return;
    }
    setLoading(true);

    // Get search range from preferences, default to 500 feet if not set
    const searchRange = userPreferences?.search_range ? parseInt(userPreferences.search_range) : 500;

    const queryParams = new URLSearchParams({
      start_lat: pickupCoordinates.lat,
      start_lon: pickupCoordinates.lng,
      end_lat: destinationCoordinates.lat,
      end_lon: destinationCoordinates.lng,
      search_range: searchRange,
      limit: 3,
    });

    try {
      const response = await fetch(`/api/uber/best-uber-fare/?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to estimate route");
      const data = await response.json();
      const opts = data.options || [];
      setFareOptions(opts);

      const optionPoints = opts.map((o) => ({
        lat: o.pickup_lat,
        lng: o.pickup_lon,
      }));
      setOptionPoints(optionPoints);
    } catch (err) {
      console.error("Route estimation error:", err);
      setErrorToast("Sorry, something went wrong fetching fares.");
    }
    setLoading(false);
  };

  const addRouteToHistory = async () => {
    if (!pickupCoordinates || !destinationCoordinates) {
      console.error("Both pickup and destination must be set to add to history");
      return;
    }
    const timezoneOffset = new Date().getTimezoneOffset();

    const addressData = {
      written_address: pickupAddress,
      final_address: destinationAddress,
      longitude_start: pickupCoordinates.lng,
      latitude_start: pickupCoordinates.lat,
      longitude_end: destinationCoordinates.lng,
      latitude_end: destinationCoordinates.lat,
      timezone_offset: timezoneOffset,
    };
    try {
      const response = await fetch("/api/profile/history/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressData),
      });
      if (!response.ok) throw new Error("Failed to add route to history");
      console.log("Route added to history successfully");
    } catch (err) {
      console.error("Error adding route to history:", err);
    }
  };

  const handleOpenUberFor = (opt) => {
    if (!opt) return;
    const CLIENT_ID = "bGx0iZIMpiDhwEoOIQX_CZNek5LBJoAfBej5JmEJ";
    const PRODUCT_ID = "2d1d002b-d4d0-4411-98e1-673b244878b2";

    const pickupData = {
      latitude: opt.pickup_lat,
      longitude: opt.pickup_lon,
      addressLine1: opt.location,
      addressLine2: "",
    };
    const dropData = {
      latitude: destinationCoordinates.lat,
      longitude: destinationCoordinates.lng,
      addressLine1: destinationAddress,
      addressLine2: "",
    };

    const url =
      `https://m.uber.com/looking?` +
      `client_id=${CLIENT_ID}` +
      `&pickup=${encodeURIComponent(JSON.stringify(pickupData))}` +
      `&drop[0]=${encodeURIComponent(JSON.stringify(dropData))}` +
      `&product_id=${PRODUCT_ID}`;

    window.open(url, "_blank");
    addRouteToHistory();
  };

  const fetchSuggestions = async (input, setterFunction) => {
    if (input.length < 3) {
      setterFunction([]);
      return;
    }
    try {
      let url = `/api/autocomplete?input=${encodeURIComponent(input)}`;
      if (location) {
        url += `&lat=${location[1]}&lng=${location[0]}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.predictions) {
        setterFunction(data.predictions);
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  // Add new useEffect hooks to handle address updates
  useEffect(() => {
    if (pickupAddress) {
      const timer = setTimeout(() => {
        updatePickupFromText();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pickupAddress]);

  useEffect(() => {
    if (destinationAddress) {
      const timer = setTimeout(() => {
        updateDestinationFromText();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [destinationAddress]);

  // Fetch saved addresses on component mount
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch("/api/profile/saved-addresses", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data);
      }
    } catch (err) {
      console.error("Error fetching saved addresses:", err);
    }
  };

  const handleSaveCurrentAddress = async () => {
    if (!destinationAddress || !newAddressNickname) return;

    try {
      const response = await fetch("/api/profile/saved-addresses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          address: destinationAddress,
          nickname: newAddressNickname,
          latitude: destinationCoordinates.lat,
          longitude: destinationCoordinates.lng,
        }),
      });
      if (response.ok) {
        setNewAddressNickname("");
        fetchSavedAddresses();
      }
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/profile/saved-addresses/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        fetchSavedAddresses();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleAddressSelect = (address) => {
    setDestinationAddress(address.address);
    setDestinationCoordinates({ lat: address.latitude, lng: address.longitude });
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box sx={{ position: "relative", width: "100%", height: "calc(100vh - 82px)", margin: 0, padding: 0 }}>
      {/* Full-screen Map */}
      <GoogleMap
        activeSelection={activeSelection}
        onSetPickup={handleSetPickup}
        onSetDestination={handleSetDestination}
        currentLocation={location ? { lat: location[1], lng: location[0] } : null}
        pickupPoint={pickupCoordinates}
        destinationPoint={destinationCoordinates}
        optionPoints={optionPoints}
      />

      {/* Floating Input Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          width: "20%",
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

        {errorToast && (
          <Alert severity="warning" onClose={() => setErrorToast("")} sx={{ mb: 2 }}>
            {errorToast}
          </Alert>
        )}

        {/* Pickup Field with Suggestions */}
        <Box sx={{ mb: 3, position: "relative" }}>
          <TextField
            label="Pickup Location"
            variant="outlined"
            fullWidth
            value={pickupAddress}
            onChange={(e) => {
              setPickupAddress(e.target.value);
              fetchSuggestions(e.target.value, setPickupSuggestions);
            }}
            onFocus={() => setActiveSelection("pickup")}
            onBlur={() => {
              setTimeout(() => {
                setPickupSuggestions([]);
                setActiveSelection("auto");
              }, 200);
            }}
            sx={{ mb: 2 }}
          />
          {pickupSuggestions.length > 0 && (
            <Paper sx={{ mt: 1, position: "absolute", zIndex: 1001, width: "100%" }}>
              {pickupSuggestions.map((suggestion) => (
                <Box
                  key={suggestion.place_id}
                  sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                  onClick={() => {
                    setPickupAddress(suggestion.description);
                    setPickupSuggestions([]);
                  }}
                >
                  <Typography>{suggestion.description}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Destination Field with Suggestions */}
        <Box sx={{ mb: 3, position: "relative" }}>
          <TextField
            label="Destination Location"
            variant="outlined"
            fullWidth
            value={destinationAddress}
            onChange={(e) => {
              setDestinationAddress(e.target.value);
              fetchSuggestions(e.target.value, setDestinationSuggestions);
            }}
            onFocus={() => setActiveSelection("destination")}
            onBlur={() => {
              setTimeout(() => {
                setDestinationSuggestions([]);
                setActiveSelection("auto");
              }, 200);
            }}
            sx={{ mb: 2 }}
          />
          {destinationSuggestions.length > 0 && (
            <Paper sx={{ mt: 1, position: "absolute", zIndex: 1001, width: "100%" }}>
              {destinationSuggestions.map((suggestion) => (
                <Box
                  key={suggestion.place_id}
                  sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                  onClick={() => {
                    setDestinationAddress(suggestion.description);
                    setDestinationSuggestions([]);
                  }}
                >
                  <Typography>{suggestion.description}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Estimate and Route Details */}
        <Button variant="contained" fullWidth onClick={estimateRoute}>
          Estimate Route
        </Button>
        {loading && (
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        )}
        {fareOptions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top {fareOptions.length} Cheapest Rides
            </Typography>

            {fareOptions.map((opt, i) => (
              <Paper
                key={i}
                onClick={() => setSelectedIdx(i)}
                elevation={selectedIdx === i ? 6 : 1}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: "pointer",
                  // thick colored border for the selected card
                  borderLeft: selectedIdx === i ? "4px solid" : "none",
                  borderColor: (theme) => theme.palette.primary.main,
                }}
              >
                <Typography variant="subtitle1">
                  {i + 1}. {opt.ride_type}
                  {selectedIdx === i && " – Selected"}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {opt.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> ${opt.price.toFixed(2)}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}

        {/* Open in Uber Button */}
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={() => handleOpenUberFor(fareOptions[selectedIdx])}
            disabled={fareOptions.length === 0}
            variant="contained"
            fullWidth
          >
            Open in Uber
          </Button>
        </Box>
      </Box>

      {/* Saved Addresses Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: "20%",
          bgcolor: "white",
          p: 2,
          borderRadius: 1,
          boxShadow: 3,
          zIndex: 1000,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Saved Addresses
        </Typography>

        {/* Add New Address */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Nickname"
            variant="outlined"
            fullWidth
            value={newAddressNickname}
            onChange={(e) => setNewAddressNickname(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSaveCurrentAddress}
            disabled={!newAddressNickname || !destinationAddress}
          >
            Save Current Destination
          </Button>
        </Box>

        {/* Saved Addresses List */}
        <Box sx={{ maxHeight: "300px", overflow: "auto" }}>
          {savedAddresses.map((address) => (
            <Paper
              key={address.id}
              sx={{
                p: 1,
                mb: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => handleAddressSelect(address)}
            >
              <Box>
                <Typography variant="subtitle1">{address.nickname}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {address.address}
                </Typography>
              </Box>
              {address.id !== "home" && (
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                >
                  Delete
                </Button>
              )}
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RouteEstimatorWithFields;
