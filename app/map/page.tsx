"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ApiReport, ApiNeighborhood } from "@/lib/api";
import { fetchReports, fetchNeighborhoods } from "@/lib/api";
import FilterBar, { type Filters } from "@/components/FilterBar";
import ReportList from "@/components/ReportList";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <LoadingState message="Carregando mapa..." />,
});

import "leaflet/dist/leaflet.css";

const EMPTY_FILTERS: Filters = { category: "", status: "", severity: "", neighborhood_id: "" };

export default function MapPage() {
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<ApiNeighborhood[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      if (filters.neighborhood_id) params.neighborhood_id = filters.neighborhood_id;

      const { data } = await fetchReports(params);
      setReports(data);
    } catch {
      setError("Não foi possível carregar as ocorrências.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNeighborhoods()
      .then(({ data }) => setNeighborhoods(data))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <Link href="/" className="text-lg font-bold text-blue-700">Via Nexo</Link>
        <Link
          href="/report"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          + Registrar
        </Link>
      </header>

      {/* Filters */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 shrink-0">
        <FilterBar
          filters={filters}
          neighborhoods={neighborhoods}
          onChange={setFilters}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar list */}
        <aside className="w-full sm:w-80 lg:w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-3">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <ReportList
              reports={reports}
              selectedId={selected?.id}
              onSelect={setSelected}
            />
          )}
        </aside>

        {/* Map */}
        <div className="flex-1 relative hidden sm:block">
          <MapView reports={reports} selectedReport={selected} />
        </div>
      </div>
    </div>
  );
}
