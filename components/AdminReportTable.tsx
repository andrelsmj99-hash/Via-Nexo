"use client";

import type { ApiReport } from "@/lib/api";
import {
  formatCategory, formatStatus, formatSeverity,
  statusColor, severityColor, formatDate, formatAddress,
} from "@/lib/formatters";
import AdminEmptyState from "./AdminEmptyState";

interface AdminReportTableProps {
  reports: ApiReport[];
  selectedId?: string | null;
  onSelect: (report: ApiReport) => void;
}

export default function AdminReportTable({ reports, selectedId, onSelect }: AdminReportTableProps) {
  if (reports.length === 0) return <AdminEmptyState />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="pb-2 pr-3 font-medium">Título</th>
            <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Categoria</th>
            <th className="pb-2 pr-3 font-medium">Status</th>
            <th className="pb-2 pr-3 font-medium hidden md:table-cell">Severidade</th>
            <th className="pb-2 font-medium hidden lg:table-cell">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r)}
              className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === r.id ? "bg-blue-50" : ""
              }`}
            >
              <td className="py-3 pr-3">
                <p className="font-medium text-gray-900 line-clamp-1">{r.title}</p>
                <p className="text-xs text-gray-500 truncate">{formatAddress(r.address, r.street_name)}</p>
              </td>
              <td className="py-3 pr-3 hidden sm:table-cell text-gray-600">{formatCategory(r.category)}</td>
              <td className="py-3 pr-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(r.status)}`}>
                  {formatStatus(r.status)}
                </span>
              </td>
              <td className="py-3 pr-3 hidden md:table-cell">
                <span className={`rounded px-2 py-0.5 text-xs ${severityColor(r.severity)}`}>
                  {formatSeverity(r.severity)}
                </span>
              </td>
              <td className="py-3 hidden lg:table-cell text-gray-500">{formatDate(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
