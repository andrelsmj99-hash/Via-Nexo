"use client";

import { useState } from "react";
import { REPORT_STATUSES } from "@/lib/constants";
import { formatStatus } from "@/lib/formatters";
import { updateReportStatus } from "@/lib/api";

interface AdminStatusActionFormProps {
  reportId: string;
  currentStatus: string;
  onSuccess: (newStatus: string) => void;
}

const inputClass = "rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function AdminStatusActionForm({
  reportId,
  currentStatus,
  onSuccess,
}: AdminStatusActionFormProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newStatus === currentStatus) return;

    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      await updateReportStatus(reportId, { status: newStatus, notes: notes || undefined });
      setSuccessMessage("Status da ocorrência atualizado com sucesso. A ação foi registrada no histórico administrativo.");
      setNotes("");
      onSuccess(newStatus);
    } catch {
      setError("Não foi possível atualizar o status da ocorrência agora. Tente novamente em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Alterar status</h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Novo status</label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Observação (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descreva o motivo ou contexto da alteração..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{error}</p>
        )}

        {successMessage && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting || newStatus === currentStatus}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Salvando..." : "Confirmar alteração"}
        </button>
      </div>
    </form>
  );
}
