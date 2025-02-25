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
import { circular } from "ol/geom/Polygon";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import useUserLocation from "../hooks/useUserLocation";

const MapComponent = ({ activeSelection, onSetPickup, onSetDestination }) => {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const [map, setMap] = useState(null);
  const { location, accuracy, error } = useUserLocation();
  const [pickupPoint, setPickupPoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);

  // Initialize the map on mount
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

    const mapObject = new Map({
      target: mapRef.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
    setMap(mapObject);

    // Add click listener to set pickup or destination point
    mapObject.on("click", (event) => {
      const coordinate = event.coordinate;
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

  // Update features: user location circle and dot, plus any pickup/destination markers.
  useEffect(() => {
    if (vectorSourceRef.current && location) {
      vectorSourceRef.current.clear(true);

      // Use a fixed radius of 9 meters (~30ft) for the circle.
      const fixedRadius = 9;
      // Convert the user's location to EPSG:3857.
      const center3857 = fromLonLat(location);
      // Create the circle geometry directly in EPSG:3857.
      const circleGeom = circular(center3857, fixedRadius, 64);

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

      // Create a point feature for the user's location.
      const pointGeom = new Point(fromLonLat(location));
      const pointFeature = new Feature(pointGeom);
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: "blue" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        })
      );

      // Add the circle and dot to the vector layer.
      vectorSourceRef.current.addFeatures([circleFeature, pointFeature]);

      // Add pickup marker if set.
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

      // Add destination marker if set.
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
  }, [location, pickupPoint, destinationPoint]);

  // Zoom in on the user's location once available.
  useEffect(() => {
    if (location && map) {
      const view = map.getView();
      view.setCenter(fromLonLat(location));
      view.setZoom(15);
    }
  }, [location, map]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} className="map-container" />;
};

export default MapComponent;
