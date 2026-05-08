import type { ReportCategory, ReportSeverity, ReportStatus } from "./constants";

export interface ApiReport {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  address: string | null;
  street_name: string | null;
  neighborhood_id: string | null;
  is_anonymous: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiReportEnriched extends ApiReport {
  images: { id: string; image_url: string }[];
  confirmations_count: number;
}

export interface ApiNeighborhood {
  id: string;
  name: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ListReportsParams {
  category?: string;
  status?: string;
  severity?: string;
  neighborhood_id?: string;
  page?: number;
  limit?: number;
}

export async function fetchReports(params: ListReportsParams = {}): Promise<{
  data: ApiReport[];
  meta: ApiMeta;
}> {
  const url = new URL("/api/reports", window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Falha ao carregar ocorrências");
  return res.json();
}

export async function fetchReport(id: string): Promise<{ data: ApiReportEnriched }> {
  const res = await fetch(`/api/reports/${id}`);
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error("Falha ao carregar ocorrência");
  return res.json();
}

export async function fetchNeighborhoods(): Promise<{ data: ApiNeighborhood[] }> {
  const res = await fetch("/api/neighborhoods");
  if (!res.ok) throw new Error("Falha ao carregar bairros");
  return res.json();
}

export async function createReport(payload: {
  title: string;
  description: string;
  category: string;
  severity: string;
  latitude: number;
  longitude: number;
  address?: string;
  street_name?: string;
  neighborhood_id?: string;
  is_anonymous?: boolean;
}): Promise<{ data: { id: string; status: string; created_at: string } }> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Falha ao criar ocorrência"), { status: res.status, body: json });
  }
  return res.json();
}

export async function uploadReportImage(
  reportId: string,
  file: File
): Promise<{ data: { id: string; image_url: string; storage_path: string } }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/reports/${reportId}/images`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Falha ao enviar imagem"), { status: res.status, body: json });
  }
  return res.json();
}

export async function fetchAdminReports(params: ListReportsParams = {}): Promise<{
  data: ApiReport[];
  meta: ApiMeta;
}> {
  const url = new URL("/api/admin/reports", window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  if (res.status === 401 || res.status === 403) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Acesso negado"), { status: res.status, body: json });
  }
  if (!res.ok) throw new Error("Falha ao carregar ocorrências administrativas");
  return res.json();
}

export async function fetchAdminReport(id: string): Promise<{ data: ApiReportEnriched }> {
  const res = await fetch(`/api/admin/reports/${id}`);
  if (res.status === 401 || res.status === 403) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Acesso negado"), { status: res.status, body: json });
  }
  if (!res.ok) throw new Error("Falha ao carregar detalhe");
  return res.json();
}

export async function updateReportStatus(
  reportId: string,
  payload: { status: string; notes?: string }
): Promise<{ data: { id: string; status: string; updated_at: string } }> {
  const res = await fetch(`/api/reports/${reportId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error("Falha ao atualizar status"), { status: res.status, body: json });
  }
  return res.json();
}
