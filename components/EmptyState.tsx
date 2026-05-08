export default function EmptyState({ message = "Nenhuma ocorrência encontrada para os filtros aplicados." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-4xl mb-3">🗺️</span>
      <p className="text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}
