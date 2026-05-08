"use client";

import type { ApiNeighborhood } from "@/lib/api";
import { REPORT_CATEGORIES, REPORT_STATUSES, REPORT_SEVERITIES } from "@/lib/constants";
import { formatCategory, formatStatus, formatSeverity } from "@/lib/formatters";

export interface AdminFilters {
  category: string;
  status: string;
  severity: string;
  neighborhood_id: string;
}

interface AdminReportFiltersProps {
  filters: AdminFilters;
  neighborhoods: ApiNeighborhood[];
  onChange: (filters: AdminFilters) => void;
}

const selectClass = "rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function AdminReportFilters({ filters, neighborhoods, onChange }: AdminReportFiltersProps) {
  function update(key: keyof AdminFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select className={selectClass} value={filters.status} onChange={(e) => update("status", e.target.value)}>
        <option value="">Todos os status</option>
        {REPORT_STATUSES.map((s) => (
          <option key={s} value={s}>{formatStatus(s)}</option>
        ))}
      </select>

      <select className={selectClass} value={filters.category} onChange={(e) => update("category", e.target.value)}>
        <option value="">Todas as categorias</option>
        {REPORT_CATEGORIES.map((c) => (
          <option key={c} value={c}>{formatCategory(c)}</option>
        ))}
      </select>

      <select className={selectClass} value={filters.severity} onChange={(e) => update("severity", e.target.value)}>
        <option value="">Todas as severidades</option>
        {REPORT_SEVERITIES.map((s) => (
          <option key={s} value={s}>{formatSeverity(s)}</option>
        ))}
      </select>

      {neighborhoods.length > 0 && (
        <select className={selectClass} value={filters.neighborhood_id} onChange={(e) => update("neighborhood_id", e.target.value)}>
          <option value="">Todos os bairros</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={() => onChange({ category: "", status: "", severity: "", neighborhood_id: "" })}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
