import React, { useEffect, useRef } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY;

const GoogleMapComponent = ({
  activeSelection,
  onSetPickup,
  onSetDestination,
  currentLocation, // { lat, lng }
  pickupPoint, // { lat, lng }
  destinationPoint, // { lat, lng }
}) => {
  const mapRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const currentLocationCircleRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  // Use a ref to always have the latest activeSelection value.
  const activeSelectionRef = useRef(activeSelection);
  useEffect(() => {
    activeSelectionRef.current = activeSelection;
  }, [activeSelection]);

  // Callback executed when the Google Map instance is loaded.
  const handleMapLoad = (mapInstance) => {
    mapRef.current = mapInstance;

    // Listen for click events on the map.
    mapInstance.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (activeSelectionRef.current === "pickup" && onSetPickup) {
        onSetPickup({ lat, lng });
      } else if (
        activeSelectionRef.current === "destination" &&
        onSetDestination
      ) {
        onSetDestination({ lat, lng });
      }
    });
  };

  // Update current location marker and circle when currentLocation changes.
  useEffect(() => {
    if (mapRef.current && currentLocation && window.google) {
      const { lat, lng } = currentLocation;
      const position = new window.google.maps.LatLng(lat, lng);

      // Create or update the current location marker (blue dot).
      if (!currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current = new window.google.maps.Marker({
          position,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "blue",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });
      } else {
        currentLocationMarkerRef.current.setPosition(position);
      }

      // Create or update the circle (e.g., representing a 9-meter radius).
      if (!currentLocationCircleRef.current) {
        currentLocationCircleRef.current = new window.google.maps.Circle({
          center: position,
          radius: 9, // in meters
          map: mapRef.current,
          strokeColor: "rgba(0, 0, 255, 0.5)",
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: "rgba(0, 0, 255, 0.1)",
          fillOpacity: 0.1,
        });
      } else {
        currentLocationCircleRef.current.setCenter(position);
      }

      // Center the map and adjust zoom level.
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(15);
    }
  }, [currentLocation]);

  // Update pickup marker.
  useEffect(() => {
    if (mapRef.current && window.google) {
      if (pickupPoint) {
        const { lat, lng } = pickupPoint;
        const position = new window.google.maps.LatLng(lat, lng);

        if (!pickupMarkerRef.current) {
          pickupMarkerRef.current = new window.google.maps.Marker({
            position,
            map: mapRef.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "green",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });
        } else {
          pickupMarkerRef.current.setPosition(position);
        }
      } else if (pickupMarkerRef.current) {
        // Remove the marker if no pickup point is defined.
        pickupMarkerRef.current.setMap(null);
        pickupMarkerRef.current = null;
      }
    }
  }, [pickupPoint]);

  // Update destination marker.
  useEffect(() => {
    if (mapRef.current && window.google) {
      if (destinationPoint) {
        const { lat, lng } = destinationPoint;
        const position = new window.google.maps.LatLng(lat, lng);

        if (!destinationMarkerRef.current) {
          destinationMarkerRef.current = new window.google.maps.Marker({
            position,
            map: mapRef.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "red",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });
        } else {
          destinationMarkerRef.current.setPosition(position);
        }
      } else if (destinationMarkerRef.current) {
        // Remove the marker if no destination point is defined.
        destinationMarkerRef.current.setMap(null);
        destinationMarkerRef.current = null;
      }
    }
  }, [destinationPoint]);

  return (
    <APIProvider apiKey={MAP_API_KEY}>
      <Map
        onMapLoad={handleMapLoad}
        defaultCenter={currentLocation || { lat: 0, lng: 0 }}
        defaultZoom={currentLocation ? 15 : 2}
        style={{ width: "100%", height: "500px" }}
      />
    </APIProvider>
  );
};

export default GoogleMapComponent;
