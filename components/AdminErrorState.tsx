interface AdminErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function AdminErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: AdminErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <span className="text-3xl mb-3">⚠️</span>
      <p className="text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
