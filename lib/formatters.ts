import type { ReportCategory, ReportSeverity, ReportStatus } from "./constants";

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  pothole: "Buraco",
  irregular_patch: "Remendo irregular",
  unpaved_road: "Via sem pavimento",
  flooding: "Alagamento",
  construction: "Obra",
  poor_signage: "Sinalização precária",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Pendente",
  under_review: "Em análise",
  confirmed: "Confirmado",
  resolved: "Resolvido",
  archived: "Arquivado",
};

const SEVERITY_LABELS: Record<ReportSeverity, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  resolved: "bg-gray-100 text-gray-700",
  archived: "bg-red-100 text-red-700",
};

const SEVERITY_COLORS: Record<ReportSeverity, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export function formatCategory(category: ReportCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function formatStatus(status: ReportStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatSeverity(severity: ReportSeverity): string {
  return SEVERITY_LABELS[severity] ?? severity;
}

export function statusColor(status: ReportStatus): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

export function severityColor(severity: ReportSeverity): string {
  return SEVERITY_COLORS[severity] ?? "bg-gray-100 text-gray-700";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatAddress(address: string | null, streetName: string | null): string {
  return address ?? streetName ?? "Endereço não informado";
}
