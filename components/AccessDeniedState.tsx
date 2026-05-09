import Link from "next/link";

export default function AccessDeniedState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="text-5xl mb-4">🔒</span>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso restrito</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-6">
        Esta área é restrita a moderadores e administradores. Verifique suas
        credenciais ou entre em contato com o administrador.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          Fazer login
        </Link>
        <Link href="/" className="text-sm text-blue-600 hover:underline self-center">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
