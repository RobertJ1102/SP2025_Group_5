import React, { useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const MAP_API_KEY = process.env.REACT_APP_GMAP_API_KEY;
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
        {/* Pickup Marker (Green) */}
        {pickupPoint && (
          <AdvancedMarker position={pickupPoint} title="Pickup">
            <Pin background="#00FF00" borderColor="#ffffff" glyph="P" />
          </AdvancedMarker>
        )}

        {/* Destination Marker (Red) */}
        {destinationPoint && (
          <AdvancedMarker position={destinationPoint} title="Destination">
            <Pin background="#FF0000" borderColor="#ffffff" glyph="D" />
          </AdvancedMarker>
        )}

        {/* Fare‑estimate Markers (Blue, numbered) */}
        {optionPoints.map((pt, i) => (
          <AdvancedMarker key={`opt-${i}`} position={pt} title={`Option ${i + 1}`}>
            <Pin background="#1976D2" borderColor="#ffffff" glyph={`${i + 1}`} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
