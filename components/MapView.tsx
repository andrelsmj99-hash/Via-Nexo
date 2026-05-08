"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { ApiReport } from "@/lib/api";
import MapMarkerPopup from "./MapMarkerPopup";

// Fix Leaflet default icon paths when bundled with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

function makeIcon(severity: string) {
  const color = SEVERITY_COLORS[severity] ?? "#6b7280";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
    className: "",
  });
}

function FlyTo({ report }: { report: ApiReport | null }) {
  const map = useMap();
  useEffect(() => {
    if (report) {
      map.flyTo([report.latitude, report.longitude], 16, { duration: 0.8 });
    }
  }, [map, report]);
  return null;
}

interface MapViewProps {
  reports: ApiReport[];
  selectedReport?: ApiReport | null;
  center?: [number, number];
  zoom?: number;
}

const DEFAULT_CENTER: [number, number] = [-23.96, -46.39];

export default function MapView({
  reports,
  selectedReport = null,
  center = DEFAULT_CENTER,
  zoom = 13,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo report={selectedReport} />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={makeIcon(r.severity)}>
          <MapMarkerPopup report={r} />
        </Marker>
      ))}
    </MapContainer>
  );
}
