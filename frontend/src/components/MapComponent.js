import React, { useEffect, useRef } from "react";
import "ol/ol.css"; // Import OpenLayers default styles
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
    return () => map.setTarget(null);
  }, []);

  return (
    <div
      style={{ width: "100%", height: "400px" }} // Set map size
      ref={mapRef}
      className="map-container"
    ></div>
  );
};

export default MapComponent;
