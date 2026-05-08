"use client";

import { useState } from "react";
import { z } from "zod";
import type { ApiNeighborhood } from "@/lib/api";
import { createReport, uploadReportImage } from "@/lib/api";
import { REPORT_CATEGORIES, REPORT_SEVERITIES } from "@/lib/constants";
import { formatCategory, formatSeverity } from "@/lib/formatters";
import ReportFormField from "./ReportFormField";
import ReportLocationPicker from "./ReportLocationPicker";
import ReportImageUpload from "./ReportImageUpload";
import ReportSuccessState from "./ReportSuccessState";
import ReportErrorState from "./ReportErrorState";

const schema = z.object({
  title: z.string().min(3, "Título deve ter ao menos 3 caracteres").max(200),
  description: z.string().min(10, "Descreva a ocorrência com ao menos 10 caracteres").max(2000),
  category: z.enum(REPORT_CATEGORIES, { errorMap: () => ({ message: "Selecione uma categoria" }) }),
  severity: z.enum(REPORT_SEVERITIES, { errorMap: () => ({ message: "Selecione a severidade" }) }),
  latitude: z.number({ invalid_type_error: "Selecione a localização no mapa" }),
  longitude: z.number({ invalid_type_error: "Selecione a localização no mapa" }),
  address: z.string().optional(),
  street_name: z.string().optional(),
  neighborhood_id: z.string().uuid().optional().or(z.literal("")),
});

type FormErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

type SubmitResult = { type: "success" } | { type: "partial" } | null;

interface ReportFormProps {
  neighborhoods: ApiNeighborhood[];
}

const inputClass = "rounded-md border border-gray-300 px-3 py-2 text-sm w-full focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function ReportForm({ neighborhoods }: ReportFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [streetName, setStreetName] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult>(null);

  if (result) {
    return <ReportSuccessState partial={result.type === "partial"} />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = schema.safeParse({
      title,
      description,
      category: category || undefined,
      severity: severity || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      address: address || undefined,
      street_name: streetName || undefined,
      neighborhood_id: neighborhoodId || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const data = parsed.data;
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        ...(data.address ? { address: data.address } : {}),
        ...(data.street_name ? { street_name: data.street_name } : {}),
        ...(data.neighborhood_id ? { neighborhood_id: data.neighborhood_id } : {}),
      };

      const { data: created } = await createReport(payload);

      if (imageFile) {
        try {
          await uploadReportImage(created.id, imageFile);
          setResult({ type: "success" });
        } catch {
          setResult({ type: "partial" });
        }
      } else {
        setResult({ type: "success" });
      }
    } catch {
      setSubmitError("Não foi possível enviar sua ocorrência agora. Revise os campos e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <ReportFormField label="Título" required error={errors.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Buraco profundo na esquina"
          className={inputClass}
        />
      </ReportFormField>

      <ReportFormField label="Descrição" required error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o problema com detalhes suficientes para identificação e resolução"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </ReportFormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ReportFormField label="Categoria" required error={errors.category}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">Selecione...</option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
        </ReportFormField>

        <ReportFormField label="Severidade" required error={errors.severity}>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputClass}>
            <option value="">Selecione...</option>
            {REPORT_SEVERITIES.map((s) => (
              <option key={s} value={s}>{formatSeverity(s)}</option>
            ))}
          </select>
        </ReportFormField>
      </div>

      <ReportFormField label="Localização" required error={errors.latitude ?? errors.longitude}>
        <ReportLocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
          error={errors.latitude ?? errors.longitude}
        />
      </ReportFormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ReportFormField label="Endereço (opcional)">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
            className={inputClass}
          />
        </ReportFormField>

        <ReportFormField label="Nome da rua (opcional)">
          <input
            type="text"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder="Ex: Rua das Flores"
            className={inputClass}
          />
        </ReportFormField>
      </div>

      {neighborhoods.length > 0 && (
        <ReportFormField label="Bairro (opcional)">
          <select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} className={inputClass}>
            <option value="">Selecione o bairro...</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </ReportFormField>
      )}

      <ReportFormField label="Imagem (opcional)">
        <ReportImageUpload onFileSelect={setImageFile} />
      </ReportFormField>

      {submitError && <ReportErrorState message={submitError} />}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Enviando..." : "Enviar ocorrência"}
      </button>
    </form>
  );
}
