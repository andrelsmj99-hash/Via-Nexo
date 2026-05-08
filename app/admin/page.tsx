"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ApiReport, ApiReportEnriched, ApiNeighborhood } from "@/lib/api";
import { fetchAdminReports, fetchAdminReport, fetchNeighborhoods } from "@/lib/api";
import AdminReportFilters, { type AdminFilters } from "@/components/AdminReportFilters";
import AdminReportTable from "@/components/AdminReportTable";
import AdminReportDetails from "@/components/AdminReportDetails";
import AdminStatusActionForm from "@/components/AdminStatusActionForm";
import AdminLoadingState from "@/components/AdminLoadingState";
import AdminErrorState from "@/components/AdminErrorState";
import AccessDeniedState from "@/components/AccessDeniedState";

const EMPTY_FILTERS: AdminFilters = { category: "", status: "", severity: "", neighborhood_id: "" };

export default function AdminPage() {
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<ApiNeighborhood[]>([]);
  const [filters, setFilters] = useState<AdminFilters>(EMPTY_FILTERS);
  const [selectedReport, setSelectedReport] = useState<ApiReportEnriched | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      if (filters.neighborhood_id) params.neighborhood_id = filters.neighborhood_id;

      const { data } = await fetchAdminReports(params);
      setReports(data);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAccessDenied(true);
      } else {
        setError("Não foi possível carregar as ocorrências.");
      }
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

  async function handleSelectReport(report: ApiReport) {
    setDetailLoading(true);
    try {
      const { data } = await fetchAdminReport(report.id);
      setSelectedReport(data);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  function handleStatusSuccess(newStatus: string) {
    if (!selectedReport) return;
    const updated = { ...selectedReport, status: newStatus as ApiReport["status"] };
    setSelectedReport(updated);
    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, status: updated.status } : r))
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-blue-700">Via Nexo</Link>
        </header>
        <AccessDeniedState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-blue-700">Via Nexo</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Painel administrativo</span>
        </div>
        <Link href="/map" className="text-sm text-blue-600 hover:underline">Ver mapa público</Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Moderação de ocorrências</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Revise, valide e atualize o status das ocorrências registradas.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
          <AdminReportFilters
            filters={filters}
            neighborhoods={neighborhoods}
            onChange={setFilters}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Table */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
            {loading ? (
              <AdminLoadingState />
            ) : error ? (
              <AdminErrorState message={error} onRetry={load} />
            ) : (
              <AdminReportTable
                reports={reports}
                selectedId={selectedReport?.id}
                onSelect={handleSelectReport}
              />
            )}

            {!loading && !error && reports.length > 0 && (
              <p className="mt-3 text-xs text-gray-400 text-right">
                {reports.length} ocorrência{reports.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Detail panel */}
          <div className="w-full lg:w-96 shrink-0">
            {detailLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <AdminLoadingState message="Carregando detalhe..." />
              </div>
            ) : selectedReport ? (
              <div className="flex flex-col gap-3">
                <AdminReportDetails
                  report={selectedReport}
                  onClose={() => setSelectedReport(null)}
                />
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <AdminStatusActionForm
                    reportId={selectedReport.id}
                    currentStatus={selectedReport.status}
                    onSuccess={handleStatusSuccess}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center text-sm text-gray-400">
                Selecione uma ocorrência na tabela para ver os detalhes e alterar o status.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
