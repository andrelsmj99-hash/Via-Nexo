interface ReportErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ReportErrorState({
  message = "Não foi possível enviar sua ocorrência agora. Revise os campos e tente novamente.",
  onRetry,
}: ReportErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-medium mb-1">Erro ao enviar</p>
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-white text-xs hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
