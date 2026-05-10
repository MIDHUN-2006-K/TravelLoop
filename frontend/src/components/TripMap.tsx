"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPoint } from "@/types";

// Dynamically import Leaflet to avoid window reference during SSR
let L: any = null;

interface TripMapProps {
  points: MapPoint[];
  loading?: boolean;
  height?: string;
}

const TripMap: React.FC<TripMapProps> = ({
  points,
  loading = false,
  height = "400px",
}) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (loading || points.length === 0 || !containerRef.current) return;

    // Lazy import Leaflet only on client side
    if (!L) {
      L = require("leaflet");
      require("leaflet/dist/leaflet.css");
    }

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([0, 0], 2);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    const bounds = L.latLngBounds([]);

    // Clear existing markers and polyline
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each point
    const coordinates: [number, number][] = [];
    points.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8,
        fillColor: "#1e40af",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      // Add popup with city name and order
      const popup = L.popup().setContent(
        `<div class="text-center"><strong>${point.order}. ${point.name}</strong></div>`
      );
      marker.bindPopup(popup);

      bounds.extend([point.lat, point.lng]);
      coordinates.push([point.lat, point.lng]);
    });

    // Draw polyline connecting all points
    if (coordinates.length > 1) {
      L.polyline(coordinates, {
        color: "#7c3aed",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 5",
      }).addTo(map);
    }

    // Fit bounds to show all markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, loading]);

  if (loading) {
    return (
      <div
        className="bg-gray-200 rounded-lg border border-gray-300 animate-pulse"
        style={{ height }}
        aria-label="Map loading"
      />
    );
  }

  if (points.length === 0) {
    return (
      <div
        className="bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500"
        style={{ height }}
        aria-label="No map data available"
      >
        No stops with location data
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile collapsible header */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-primary text-white rounded-lg flex justify-between items-center hover:bg-blue-700 transition"
          aria-expanded={isExpanded}
          aria-label="Toggle map view"
        >
          <span className="font-medium">View Route Map</span>
          <span>{isExpanded ? "−" : "+"}</span>
        </button>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className={`${
          isExpanded ? "block" : "hidden lg:block"
        } w-full rounded-lg border border-gray-300 overflow-hidden`}
        style={{ height: isExpanded ? "500px" : height }}
        aria-label="Trip route map"
        role="region"
      />

      {/* Legend */}
      {isExpanded ||
        (window.innerWidth >= 1024 && (
          <div className="mt-4 text-xs text-gray-600">
            <p className="mb-2">
              <strong>Map Legend:</strong>
            </p>
            <ul className="space-y-1">
              <li>
                🔵 Blue circles = Stop locations (in order 1→{points.length})
              </li>
              <li>━━ Purple dashed line = Trip route</li>
            </ul>
          </div>
        ))}
    </div>
  );
};

export default TripMap;
