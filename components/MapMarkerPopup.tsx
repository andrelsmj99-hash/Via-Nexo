import { Popup } from "react-leaflet";
import Link from "next/link";
import type { ApiReport } from "@/lib/api";
import { formatCategory, formatStatus, formatSeverity, statusColor, severityColor } from "@/lib/formatters";

export default function MapMarkerPopup({ report }: { report: ApiReport }) {
  return (
    <Popup>
      <div className="min-w-[180px]">
        <p className="font-semibold text-sm mb-1 leading-tight">{report.title}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(report.status)}`}>
            {formatStatus(report.status)}
          </span>
          <span className={`rounded px-2 py-0.5 text-xs ${severityColor(report.severity)}`}>
            {formatSeverity(report.severity)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-2">{formatCategory(report.category)}</p>
        <Link
          href={`/reports/${report.id}`}
          className="text-xs text-blue-600 hover:underline"
        >
          Ver detalhes →
        </Link>
      </div>
    </Popup>
  );
}
