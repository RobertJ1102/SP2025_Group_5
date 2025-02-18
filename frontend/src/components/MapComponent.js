import React, { useEffect, useRef } from "react";
import "ol/ol.css"; // OpenLayers default styles
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { circular } from "ol/geom/Polygon";
import { fromLonLat } from "ol/proj";
import useUserLocation from "../hooks/useUserLocation";

const MapComponent = () => {
  const mapRef = useRef(null);
  // Keep a ref for the vector source so we can update it without recreating it.
  const vectorSourceRef = useRef(null);

  // Get location info from our custom hook.
  const { location, accuracy, error } = useUserLocation();

  // Initialize the map only once on mount.
  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    // Create a vector source and store it in a ref.
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  // Update map features whenever location or accuracy changes.
  useEffect(() => {
    if (location && accuracy && vectorSourceRef.current) {
      // Create a circular geometry for the accuracy circle.
      const circleGeom = circular(location, accuracy);
      // Transform the circle from EPSG:4326 (lon/lat) to the map projection (usually EPSG:3857).
      circleGeom.transform("EPSG:4326", "EPSG:3857");

      // Create a point feature using fromLonLat to transform location.
      const pointGeom = new Point(fromLonLat(location));

      // Clear and update the features.
      vectorSourceRef.current.clear(true);
      vectorSourceRef.current.addFeatures([
        new Feature(circleGeom),
        new Feature(pointGeom),
      ]);
    }
  }, [location, accuracy]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      ref={mapRef}
      className="map-container"
    ></div>
  );
};

export default MapComponent;
