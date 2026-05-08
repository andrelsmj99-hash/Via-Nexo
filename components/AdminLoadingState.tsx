export default function AdminLoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
