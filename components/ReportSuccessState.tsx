import Link from "next/link";

interface ReportSuccessStateProps {
  partial?: boolean;
}

export default function ReportSuccessState({ partial = false }: ReportSuccessStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <span className="text-5xl mb-4">{partial ? "⚠️" : "✅"}</span>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {partial ? "Ocorrência criada com sucesso" : "Ocorrência enviada com sucesso!"}
      </h2>
      <p className="text-gray-600 text-sm max-w-xs mb-6">
        {partial
          ? "Sua ocorrência foi registrada, mas a imagem não pôde ser enviada. Você poderá tentar novamente em uma versão futura."
          : "Sua ocorrência e a evidência visual foram registradas. Obrigado por contribuir com o Via Nexo!"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/map"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          Ver no mapa
        </Link>
        <Link
          href="/report"
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Registrar outra
        </Link>
      </div>
    </div>
  );
}
