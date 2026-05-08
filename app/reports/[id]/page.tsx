import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReportDetails from "@/components/ReportDetails";

interface Props {
  params: Promise<{ id: string }>;
}

async function getReport(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/reports/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Falha ao carregar ocorrência");
  const json = await res.json();
  return json.data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const report = await getReport(id);
    if (!report) return { title: "Ocorrência não encontrada — Via Nexo" };
    return { title: `${report.title} — Via Nexo` };
  } catch {
    return { title: "Via Nexo" };
  }
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id).catch(() => null);

  if (!report) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-blue-700">Via Nexo</Link>
          <span className="text-gray-300">/</span>
          <Link href="/map" className="text-sm text-gray-500 hover:text-gray-800">Mapa</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500 truncate">Ocorrência</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/map" className="text-sm text-blue-600 hover:underline">← Voltar ao mapa</Link>
        </div>
        <ReportDetails report={report} />
      </main>
    </div>
  );
}
