import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Via Nexo — Mapeamento Urbano Colaborativo",
  description:
    "Plataforma colaborativa para registro e acompanhamento de ocorrências na malha viária.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
