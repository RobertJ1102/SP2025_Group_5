import React, { useState, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import MapComponent from "./MapComponent";
import axios from "axios";
import debounce from "lodash/debounce";

const HomePage = () => {
  const [destination, setDestination] = useState("");
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const fetchAddressOptions = async (value) => {
    if (value.length > 2) {
      try {
        const response = await axios.get("http://127.0.0.1:8000/geocode", {
          params: {
            q: value,
          },
        });
        setAddressOptions(response.data);
      } catch (error) {
        console.error("Error fetching address options:", error);
      }
    } else {
      setAddressOptions([]);
    }
  };

  const debouncedFetchAddressOptions = useCallback(
    debounce(fetchAddressOptions, 300),
    []
  );

  const handleInputChange = (event, value) => {
    setDestination(value);
    debouncedFetchAddressOptions(value);
  };

  const handleAddressSelect = (event, value) => {
    setSelectedAddress(value);
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0, // Keeps it interactive but behind the content
        }}
      >
        <MapComponent destination={selectedAddress} />
      </Box>
      <Container
        maxWidth="xs"
        sx={{
          position: "absolute",
          zIndex: 2, // Ensure the container is above the map
          top: 60,
          left: 5,
        }}
      >
        <Autocomplete
          options={addressOptions}
          getOptionLabel={(option) => option.display_name}
          onInputChange={handleInputChange}
          onChange={handleAddressSelect}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destination"
              fullWidth
              margin="normal"
            />
          )}
        />
      </Container>
      <Container
        maxWidth="xs"
        sx={{
          position: "absolute",
          zIndex: 1,
          color: "white",
          bottom: 20,
          right: 20,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            marginTop: 4,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent background for readability
            backdropFilter: "blur(5px)",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to FareFinder
          </Typography>
          <Typography variant="body1">
            This application helps you find the best nearby location to book an
            Uber ride by comparing fares within a 400ft radius.
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">🚗 Features Coming Soon:</Typography>
            <ul>
              <li>Check fare estimates for different pickup points</li>
              <li>Compare Uber and Lyft prices dynamically</li>
              <li>Find the cheapest and fastest routes</li>
            </ul>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default HomePage;
