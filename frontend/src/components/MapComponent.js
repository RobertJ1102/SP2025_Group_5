import React, { useEffect, useRef } from "react";
import "ol/ol.css"; // Import OpenLayers default styles
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the map when the component mounts
    const map = new Map({
      target: mapRef.current, // Bind map to div
      layers: [
        new TileLayer({
          source: new OSM(), // OpenStreetMap tile layer
        }),
      ],
      view: new View({
        center: [0, 0], // Coordinates in EPSG:3857 projection
        zoom: 2, // Zoom level
      }),
    });

    return () => {
      map.setTarget(null); // Cleanup on unmount
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px" }} // Set map size
      className="map-container"
    />
  );
};

export default MapComponent;
