import Link from "next/link";
import ReportForm from "@/components/ReportForm";

async function getNeighborhoods() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/neighborhoods`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Registrar ocorrência — Via Nexo",
};

export default async function ReportPage() {
  const neighborhoods = await getNeighborhoods();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-blue-700">Via Nexo</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Registrar ocorrência</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/map" className="text-sm text-blue-600 hover:underline">← Voltar ao mapa</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Registrar ocorrência</h1>
          <p className="text-gray-500 text-sm mt-1">
            Informe os detalhes do problema encontrado. Campos com * são obrigatórios.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <ReportForm neighborhoods={neighborhoods} />
        </div>
      </main>
    </div>
  );
}
