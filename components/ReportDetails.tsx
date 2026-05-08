import type { ApiReportEnriched } from "@/lib/api";
import {
  formatCategory, formatStatus, formatSeverity,
  statusColor, severityColor, formatDate, formatAddress,
} from "@/lib/formatters";

export default function ReportDetails({ report }: { report: ApiReportEnriched }) {
  const address = formatAddress(report.address, report.street_name);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold text-gray-900 leading-snug">{report.title}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(report.status)}`}>
          {formatStatus(report.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
          {formatCategory(report.category)}
        </span>
        <span className={`rounded px-2.5 py-1 text-sm font-medium ${severityColor(report.severity)}`}>
          Severidade: {formatSeverity(report.severity)}
        </span>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{report.description}</p>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <dt className="text-gray-500">Endereço</dt>
          <dd className="text-gray-800">{address}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Confirmações</dt>
          <dd className="text-gray-800">{report.confirmations_count}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Criado em</dt>
          <dd className="text-gray-800">{formatDate(report.created_at)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Atualizado em</dt>
          <dd className="text-gray-800">{formatDate(report.updated_at)}</dd>
        </div>
      </dl>

      {report.images.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-medium text-gray-600 mb-2">Imagens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {report.images.map((img) => (
              <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt="Evidência da ocorrência"
                  className="rounded-md object-cover w-full h-32 border border-gray-200 hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
