import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Via Nexo",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            Via Nexo
          </Link>
          <p className="text-gray-500 text-sm mt-1">
            Acesso ao painel administrativo
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-5">
            Entrar na conta
          </h1>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso restrito a moderadores e administradores.
        </p>
      </div>
    </div>
  );
}
