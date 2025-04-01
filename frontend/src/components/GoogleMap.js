import React, { useCallback, useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY;

const INITIAL_CAMERA = {
  center: { lat: 0, lng: 0 },
  zoom: 2,
};

const GoogleMap = ({
  activeSelection,
  onSetPickup,
  onSetDestination,
  currentLocation, // { lat, lng }
  pickupPoint, // { lat, lng }
  destinationPoint, // { lat, lng }
}) => {
  // For custom marker icons (circle symbols).
  const [googleAPI, setGoogleAPI] = useState(null);

  // Map load callback: set googleAPI so we can reference SymbolPath
  const handleMapLoad = useCallback(() => {
    setGoogleAPI(window.google);
  }, []);

  // Helper to create a custom marker icon using circle symbols.
  const getMarkerIcon = (color, scale) => {
    if (
      googleAPI &&
      googleAPI.maps &&
      googleAPI.maps.SymbolPath &&
      googleAPI.maps.SymbolPath.CIRCLE
    ) {
      return {
        path: googleAPI.maps.SymbolPath.CIRCLE,
        scale: scale,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 2,
      };
    }
    // Fallback to default marker if SymbolPath not available yet.
    return undefined;
  };

  // Click handler: convert the event's coordinates to an array [lng, lat]
  const handleMapClick = useCallback(
    (ev) => {
      console.log("Map click event:", ev); // For debugging

      // Try to extract the latLng value
      const eventLatLng = ev?.latLng || ev?.detail?.latLng;
      if (!eventLatLng) {
        console.warn("Click event does not have latLng:", ev);
        return;
      }

      let lat, lng;
      if (typeof eventLatLng.lat === "function") {
        // When latLng is an object with methods
        lat = eventLatLng.lat();
        lng = eventLatLng.lng();
      } else {
        // When latLng is a literal object
        lat = Number(eventLatLng.lat);
        lng = Number(eventLatLng.lng);
      }

      // Convert to an array of numbers. Note: original code used [lng, lat].
      const coordinates = [lng, lat];

      if (activeSelection === "pickup" && onSetPickup) {
        onSetPickup(coordinates);
      } else if (activeSelection === "destination" && onSetDestination) {
        onSetDestination(coordinates);
      }
    },
    [activeSelection, onSetPickup, onSetDestination]
  );

  return (
    <APIProvider apiKey={MAP_API_KEY}>
      <Map
        defaultCenter={currentLocation ?? INITIAL_CAMERA.center}
        defaultZoom={currentLocation ? 15 : INITIAL_CAMERA.zoom}
        onMapLoad={handleMapLoad}
        onClick={handleMapClick}
        style={{ width: "100%", height: "500px" }}
      >
        {/* Pickup Marker (Green) */}
        {pickupPoint && (
          <Marker
            position={pickupPoint}
            options={{ icon: getMarkerIcon("green", 10) }}
          />
        )}

        {/* Destination Marker (Red) */}
        {destinationPoint && (
          <Marker
            position={destinationPoint}
            options={{ icon: getMarkerIcon("red", 10) }}
          />
        )}
      </Map>
    </APIProvider>
  );
};

export default GoogleMap;
