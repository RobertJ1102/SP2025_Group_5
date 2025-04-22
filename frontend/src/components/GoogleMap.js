import React, { useCallback } from "react";
import { APIProvider, Map, Marker, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY;
// You must supply a valid Map ID for advanced markers to work
const MAP_ID = process.env.REACT_APP_GMAP_MAP_ID;

const INITIAL_CAMERA = {
  center: { lat: 38.64914935584339, lng: -90.31138747373849 },
  zoom: 15,
};

export default function GoogleMap({
  activeSelection,
  onSetPickup,
  onSetDestination,
  currentLocation,
  pickupPoint,
  destinationPoint,
  optionPoints = [],
}) {
  const handleMapClick = useCallback(
    (ev) => {
      const eventLatLng = ev?.latLng || ev?.detail?.latLng;
      if (!eventLatLng) return;
      const lat = typeof eventLatLng.lat === "function" ? eventLatLng.lat() : Number(eventLatLng.lat);
      const lng = typeof eventLatLng.lng === "function" ? eventLatLng.lng() : Number(eventLatLng.lng);
      const coords = [lng, lat];

      if (activeSelection === "auto") {
        if (!pickupPoint) onSetPickup(coords);
        else onSetDestination(coords);
      } else if (activeSelection === "pickup") {
        onSetPickup(coords);
      } else if (activeSelection === "destination") {
        onSetDestination(coords);
      }
    },
    [activeSelection, onSetPickup, onSetDestination, pickupPoint]
  );

  return (
    <APIProvider apiKey={MAP_API_KEY} libraries={["marker"]} version="beta">
      <Map
        mapId={MAP_ID}
        defaultCenter={currentLocation ?? INITIAL_CAMERA.center}
        defaultZoom={currentLocation ? INITIAL_CAMERA.zoom : INITIAL_CAMERA.zoom}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Current Location Dot */}
        {currentLocation && window.google?.maps?.SymbolPath && (
          <Marker
            position={currentLocation}
            options={{
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
              zIndex: 100,
            }}
          />
        )}

        {/* Pickup Marker (Green Pin) */}
        {pickupPoint && (
          <AdvancedMarker position={pickupPoint} title="Pickup">
            <Pin background="#00FF00" borderColor="#ffffff" glyph="P" />
          </AdvancedMarker>
        )}

        {/* Destination Marker (Red Pin) */}
        {destinationPoint && (
          <AdvancedMarker position={destinationPoint} title="Destination">
            <Pin background="#FF0000" borderColor="#ffffff" glyph="D" />
          </AdvancedMarker>
        )}

        {/* Fare‑estimate Markers (Blue Pins), skip current-location duplicates */}
        {optionPoints.map((pt, i) => {
          const isCurrent = currentLocation && pt.lat === currentLocation.lat && pt.lng === currentLocation.lng;
          if (isCurrent) return null;

          return (
            <AdvancedMarker key={`opt-${i}`} position={pt} title={`Option ${i + 1}`}>
              <Pin background="#1976D2" borderColor="#ffffff" glyph={`${i + 1}`} />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}
