import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { circular } from "ol/geom/Polygon.js";
import { fromLonLat } from "ol/proj";
import axios from "axios";
import useUserLocation from "../hooks/useUserLocation";

const MapComponent = ({ destination }) => {
  const mapDOM = useRef(null); // Reference to the map div
  const mapObj = useRef(null); // Reference to OpenLayers map instance
  const vectorSourceRef = useRef(null); // Reference to Vector Source
  const { location, accuracy, error } = useUserLocation();

  // ✅ Create the map only once (DO NOT depend on location or accuracy)
  useEffect(() => {
    if (!mapDOM.current || mapObj.current) return;

    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    vectorSourceRef.current = new VectorSource(); // ✅ Initialize once
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });

    mapObj.current = new Map({
      target: mapDOM.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]), // ✅ Default center
        zoom: 2, // ✅ Default zoom
      }),
    });
  }, []); // ✅ Only runs once when the component mounts

  // ✅ Update the map dynamically when location changes
  useEffect(() => {
    if (!location || !accuracy || !mapObj.current || !vectorSourceRef.current)
      return;

    // Convert location to map coordinates
    const newCenter = fromLonLat(location);

    // Update accuracy circle and position
    const circleGeom = circular(location, accuracy);
    circleGeom.transform("EPSG:4326", "EPSG:3857");

    const pointGeom = new Point(newCenter);

    // ✅ Update vector source instead of recreating the map
    vectorSourceRef.current.clear();
    vectorSourceRef.current.addFeatures([
      new Feature(circleGeom),
      new Feature(pointGeom),
    ]);

    // ✅ Update the existing map view (DO NOT recreate the map)
    mapObj.current.getView().setCenter(newCenter);
    mapObj.current.getView().setZoom(16);
  }, [location, accuracy]); // ✅ Runs only when location updates

  // ✅ Geocode the destination address and place a marker on the map
  useEffect(() => {
    if (!destination || !mapObj.current || !vectorSourceRef.current) return;

    const geocodeDestination = async (address) => {
      try {
        const { lat, lon } = address;
        const destinationCoords = fromLonLat([
          parseFloat(lon),
          parseFloat(lat),
        ]);

        const pointGeom = new Point(destinationCoords);

        // Add the destination marker as a separate feature
        vectorSourceRef.current.addFeature(new Feature(pointGeom));

        // Update the map view to show both current location and destination
        const extent = vectorSourceRef.current.getExtent();
        mapObj.current.getView().fit(extent, { padding: [50, 50, 50, 50] });
      } catch (error) {
        console.error("Error geocoding destination:", error);
      }
    };

    if (destination && mapObj.current && vectorSourceRef.current) {
      geocodeDestination(destination);
    }
  }, [destination]);

  // ✅ Cleanup the map only when component unmounts
  useEffect(() => {
    return () => {
      if (mapObj.current) {
        mapObj.current.setTarget(null);
      }
    };
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      ref={mapDOM}
      style={{ width: "100%", height: "100vh" }}
      className="map-container"
    ></div>
  );
};

export default MapComponent;
