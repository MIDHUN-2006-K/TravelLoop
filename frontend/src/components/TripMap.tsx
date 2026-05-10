"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { helperService } from "@/services/api";
import { MapPoint } from "@/types";
import { MapSkeleton } from "@/components/Skeletons";

// Fix Leaflet icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createNumberedIcon(num: number) {
  return L.divIcon({
    html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3366ff,#1a45f5);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(51,102,255,0.4)">${num}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 10);
    } else {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [points, map]);
  return null;
}

interface Props { tripId: string; }

export default function TripMap({ tripId }: Props) {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    helperService.getTripMapPoints(tripId).then((data) => {
      setPoints(data);
      setLoading(false);
    });
  }, [tripId]);

  if (loading) return <MapSkeleton />;

  if (points.length === 0) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-semibold text-surface-700">No locations to show</p>
          <p className="text-sm text-surface-400 mt-1">Add cities to your itinerary to see them on the map</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [points[0].lat, points[0].lng];
  const routeCoords: [number, number][] = points.map((p) => [p.lat, p.lng]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden shadow-premium-lg" style={{ height: "480px" }}>
        <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />

          {/* Route Line */}
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#3366ff", weight: 3, opacity: 0.7, dashArray: "8, 6" }}
            />
          )}

          {/* Markers */}
          {points.map((point) => (
            <Marker key={point.city_id || point.name} position={[point.lat, point.lng]} icon={createNumberedIcon(point.order)}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-surface-900 text-sm">Stop {point.order}</p>
                  <p className="text-surface-600 text-sm">{point.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {points.map((point) => (
          <div key={point.name} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-surface-200 shadow-premium">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {point.order}
            </div>
            <span className="text-sm font-medium text-surface-700">{point.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
