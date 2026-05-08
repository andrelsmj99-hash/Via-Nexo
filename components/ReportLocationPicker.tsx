"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";

const LocationMap = dynamic(() => import("./LocationMapInner"), { ssr: false });

interface ReportLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  error?: string;
}

export default function ReportLocationPicker({ latitude, longitude, onChange, error }: ReportLocationPickerProps) {
  const handlePick = useCallback((lat: number, lng: number) => {
    onChange(lat, lng);
  }, [onChange]);

  return (
    <div>
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <LocationMap lat={latitude} lng={longitude} onPick={handlePick} />
      </div>
      {latitude && longitude && (
        <p className="mt-1 text-xs text-gray-500">
          Localização: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
      {!latitude && !longitude && (
        <p className="mt-1 text-xs text-gray-500">Clique no mapa para marcar a localização da ocorrência.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
