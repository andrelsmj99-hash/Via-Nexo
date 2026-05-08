import type { ApiReportEnriched } from "@/lib/api";
import {
  formatCategory, formatStatus, formatSeverity,
  statusColor, severityColor, formatDate, formatAddress,
} from "@/lib/formatters";

interface AdminReportDetailsProps {
  report: ApiReportEnriched;
  onClose?: () => void;
}

export default function AdminReportDetails({ report, onClose }: AdminReportDetailsProps) {
  const address = formatAddress(report.address, report.street_name);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h2 className="font-semibold text-gray-900 leading-snug">{report.title}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none"
            aria-label="Fechar detalhes"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(report.status)}`}>
          {formatStatus(report.status)}
        </span>
        <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
          {formatCategory(report.category)}
        </span>
        <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${severityColor(report.severity)}`}>
          {formatSeverity(report.severity)}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{report.description}</p>

      <dl className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div><dt className="text-gray-400">Endereço</dt><dd className="text-gray-700">{address}</dd></div>
        <div><dt className="text-gray-400">Confirmações</dt><dd className="text-gray-700">{report.confirmations_count}</dd></div>
        <div><dt className="text-gray-400">Coords</dt><dd className="text-gray-700">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</dd></div>
        <div><dt className="text-gray-400">Criado</dt><dd className="text-gray-700">{formatDate(report.created_at)}</dd></div>
        <div><dt className="text-gray-400">Atualizado</dt><dd className="text-gray-700">{formatDate(report.updated_at)}</dd></div>
      </dl>

      {report.images.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Imagens ({report.images.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {report.images.map((img) => (
              <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt=""
                  className="rounded object-cover w-20 h-20 border border-gray-200 hover:opacity-90"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
