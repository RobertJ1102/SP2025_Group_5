import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css"; // OpenLayers default styles
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { circular } from "ol/geom/Polygon";

const MapComponent = ({ activeSelection, onSetPickup, onSetDestination }) => {
  // activeSelection should be either "pickup" or "destination"
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pickupPoint, setPickupPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);

  // Initialize the map
  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const initialView = new View({
      center: fromLonLat([0, 0]),
      zoom: 2,
    });

    const mapObject = new Map({
      target: mapRef.current,
      layers: [osmLayer, vectorLayer],
      view: initialView,
    });

    setMap(mapObject);

    // Add click listener to set pickup or destination point
    mapObject.on("click", (event) => {
      const coordinate = event.coordinate;
      // Convert coordinate to longitude/latitude
      const lonLat = toLonLat(coordinate);
      if (activeSelection === "pickup") {
        setPickupPoint(coordinate);
        if (onSetPickup) onSetPickup(lonLat);
      } else if (activeSelection === "destination") {
        setDestinationPoint(coordinate);
        if (onSetDestination) onSetDestination(lonLat);
      }
    });

    return () => {
      mapObject.setTarget(null);
    };
  }, [activeSelection, onSetPickup, onSetDestination]);

  // Get user location and zoom in
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [longitude, latitude];
          setUserLocation(coords);
          if (map) {
            const view = map.getView();
            view.setCenter(fromLonLat(coords));
            view.setZoom(15);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [map]);

  // Update vector layer features when any point changes
  useEffect(() => {
    if (vectorSourceRef.current && userLocation) {
      vectorSourceRef.current.clear(true);

      // Create a circle in EPSG:3857 coordinates
      // Convert userLocation to EPSG:3857 first
      const center3857 = fromLonLat(userLocation);
      // Use a fixed radius of 9 meters (approx. 30ft)
      const radius = 9;
      const circleGeom = circular(center3857, radius, 64);
      // No need to transform since center3857 is already in EPSG:3857

      const circleFeature = new Feature(circleGeom);
      circleFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgba(0, 0, 255, 0.5)",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.1)",
          }),
        })
      );
      vectorSourceRef.current.addFeature(circleFeature);

      // Pickup Marker
      if (pickupPoint) {
        const pickupFeature = new Feature(new Point(pickupPoint));
        pickupFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "green" }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          })
        );
        vectorSourceRef.current.addFeature(pickupFeature);
      }

      // Destination Marker
      if (destinationPoint) {
        const destFeature = new Feature(new Point(destinationPoint));
        destFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "red" }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          })
        );
        vectorSourceRef.current.addFeature(destFeature);
      }
    }
  }, [userLocation, pickupPoint, destinationPoint]);

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} />;
};

export default MapComponent;
