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
  currentLocation, // { lat, lng }
  pickupPoint, // { lat, lng }
  destinationPoint, // { lat, lng }
}) => {
  const mapRef = useRef(null);
  const currentLocationSourceRef = useRef(null);
  const markerSourceRef = useRef(null);
  const [map, setMap] = useState(null);

  // Use a ref to store activeSelection so that the click handler always gets the latest value.
  const activeSelectionRef = useRef(activeSelection);
  useEffect(() => {
    activeSelectionRef.current = activeSelection;
  }, [activeSelection]);

  // Initialize the map and two vector layers only once.
  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    // Current location layer (blue dot and circle)
    const currentLocationSource = new VectorSource();
    currentLocationSourceRef.current = currentLocationSource;
    const currentLocationLayer = new VectorLayer({
      source: currentLocationSource,
    });

    // Marker layer for pickup/destination
    const markerSource = new VectorSource();
    markerSourceRef.current = markerSource;
    const markerLayer = new VectorLayer({
      source: markerSource,
    });

    const mapObject = new Map({
      target: mapRef.current,
      layers: [osmLayer, currentLocationLayer, markerLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
    setMap(mapObject);

    // Add click listener once.
    mapObject.on("click", (event) => {
      const coordinate = event.coordinate;
      const lonLat = toLonLat(coordinate);
      if (activeSelectionRef.current === "pickup") {
        if (onSetPickup) onSetPickup(lonLat);
      } else if (activeSelectionRef.current === "destination") {
        if (onSetDestination) onSetDestination(lonLat);
      }
    });

    return () => {
      mapObject.setTarget(null);
    };
  }, []); // Note: empty dependency array so the map is created only once

  // Update the current location layer (blue dot and circle) whenever currentLocation changes.
  useEffect(() => {
    if (currentLocationSourceRef.current && currentLocation) {
      const currentLocationSource = currentLocationSourceRef.current;
      currentLocationSource.clear(true);

      const currentCenter = fromLonLat([currentLocation.lng, currentLocation.lat]);
      const fixedRadius = 9; // 9 meters ~ 30ft.
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

      currentLocationSource.addFeatures([circleFeature, dotFeature]);
    }
  }, [currentLocation]);

  // Update marker layer for pickup and destination markers.
  useEffect(() => {
    if (markerSourceRef.current) {
      const markerSource = markerSourceRef.current;
      markerSource.clear(true);

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
        markerSource.addFeature(pickupFeature);
      }

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
        markerSource.addFeature(destFeature);
      }
    }
  }, [pickupPoint, destinationPoint]);

  // When current location is available, zoom in.
  useEffect(() => {
    if (currentLocation && map) {
      const view = map.getView();
      view.setCenter(fromLonLat([currentLocation.lng, currentLocation.lat]));
      view.setZoom(15);
    }
  }, [currentLocation, map]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};

export default MapComponent;
