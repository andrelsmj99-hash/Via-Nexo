"use client";

import { useRef, useState } from "react";
import { REPORT_IMAGE_ALLOWED_MIME_TYPES, REPORT_IMAGE_MAX_SIZE_BYTES } from "@/lib/constants";

interface ReportImageUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export default function ReportImageUpload({ onFileSelect, error }: ReportImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!(REPORT_IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      return "A imagem precisa estar em formato JPG, PNG ou WEBP.";
    }
    if (file.size > REPORT_IMAGE_MAX_SIZE_BYTES) {
      return "A imagem excede o tamanho máximo permitido (5 MB).";
    }
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLocalError(null);
    setPreview(null);

    if (!file) {
      onFileSelect(null);
      return;
    }

    const err = validate(file);
    if (err) {
      setLocalError(err);
      onFileSelect(null);
      e.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }

  function handleRemove() {
    setPreview(null);
    setLocalError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const displayError = error ?? localError;

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Pré-visualização" className="rounded-lg max-h-48 object-cover border border-gray-200" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 rounded-full bg-gray-900/60 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-900"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <span className="text-2xl mb-1">📷</span>
          <span className="text-sm text-gray-500">Clique para selecionar uma imagem</span>
          <span className="text-xs text-gray-400 mt-0.5">JPG, PNG ou WEBP até 5 MB</span>
          <input
            ref={inputRef}
            type="file"
            accept={REPORT_IMAGE_ALLOWED_MIME_TYPES.join(",")}
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      )}
      {displayError && <p className="mt-1 text-xs text-red-600">{displayError}</p>}
    </div>
  );
}
