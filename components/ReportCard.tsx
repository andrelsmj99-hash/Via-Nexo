import Link from "next/link";
import type { ApiReport } from "@/lib/api";
import { formatCategory, formatStatus, formatSeverity, statusColor, severityColor, formatDate, formatAddress } from "@/lib/formatters";

interface ReportCardProps {
  report: ApiReport & { confirmations_count?: number };
  onClick?: () => void;
  selected?: boolean;
}

export default function ReportCard({ report, onClick, selected }: ReportCardProps) {
  const address = formatAddress(report.address, report.street_name);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`rounded-lg border bg-white p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? "border-blue-500 shadow-md" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{report.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(report.status)}`}>
          {formatStatus(report.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {formatCategory(report.category)}
        </span>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${severityColor(report.severity)}`}>
          {formatSeverity(report.severity)}
        </span>
      </div>

      <p className="text-xs text-gray-500 truncate mb-2">{address}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(report.created_at)}</span>
        {(report.confirmations_count ?? 0) > 0 && (
          <span>{report.confirmations_count} confirmação{(report.confirmations_count ?? 0) !== 1 ? "ões" : ""}</span>
        )}
      </div>

      <Link
        href={`/reports/${report.id}`}
        className="mt-2 block text-xs text-blue-600 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Ver detalhes →
      </Link>
    </div>
  );
}
