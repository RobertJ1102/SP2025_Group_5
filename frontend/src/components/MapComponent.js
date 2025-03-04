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

const MapComponent = ({
  activeSelection,
  onSetPickup,
  onSetDestination,
  currentLocation, // object { lat, lng } for the user's current location
  pickupPoint, // object { lat, lng } for the pickup marker
  destinationPoint, // object { lat, lng } for the destination marker
}) => {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const [map, setMap] = useState(null);

  // Initialize the map only once.
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

    // Add click listener to set pickup or destination by map.
    mapObject.on("click", (event) => {
      const coordinate = event.coordinate;
      const lonLat = toLonLat(coordinate);
      if (activeSelection === "pickup") {
        if (onSetPickup) onSetPickup(lonLat);
      } else if (activeSelection === "destination") {
        if (onSetDestination) onSetDestination(lonLat);
      }
    });

    return () => {
      mapObject.setTarget(null);
    };
  }, [activeSelection, onSetPickup, onSetDestination]);

  // Update features whenever current location, pickup, or destination change.
  useEffect(() => {
    if (vectorSourceRef.current && currentLocation) {
      vectorSourceRef.current.clear(true);

      // Convert current location to map projection.
      const currentCenter = fromLonLat([currentLocation.lng, currentLocation.lat]);

      // Create a fixed circle with a radius of 9 meters (~30ft).
      const fixedRadius = 9;
      const circleGeom = circular(currentCenter, fixedRadius, 64);
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

      // Create a dot for the user's current location.
      const dotFeature = new Feature(new Point(currentCenter));
      dotFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: "blue" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
        })
      );

      // Add current location features.
      vectorSourceRef.current.addFeatures([circleFeature, dotFeature]);

      // Add pickup marker if it exists.
      if (pickupPoint) {
        const pickupCoord = fromLonLat([pickupPoint.lng, pickupPoint.lat]);
        const pickupFeature = new Feature(new Point(pickupCoord));
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

      // Add destination marker if it exists.
      if (destinationPoint) {
        const destCoord = fromLonLat([destinationPoint.lng, destinationPoint.lat]);
        const destFeature = new Feature(new Point(destCoord));
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
  }, [currentLocation, pickupPoint, destinationPoint]);

  // When current location is available, zoom in.
  useEffect(() => {
    if (currentLocation && map) {
      const view = map.getView();
      view.setCenter(fromLonLat([currentLocation.lng, currentLocation.lat]));
      view.setZoom(15);
    }
  }, [currentLocation, map]);

  return <div ref={mapRef} style={{ width: "100%", height: "300px" }} />;
};

export default MapComponent;
