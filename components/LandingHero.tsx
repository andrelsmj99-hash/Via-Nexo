import Link from "next/link";

export default function LandingHero() {
  return (
    <section className="bg-blue-700 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          Via Nexo
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
          Plataforma colaborativa de mapeamento urbano. Registre, visualize e acompanhe
          ocorrências na malha viária da sua cidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/map"
            className="rounded-lg bg-white text-blue-700 font-semibold px-6 py-3 hover:bg-blue-50 transition-colors"
          >
            Ver o mapa
          </Link>
          <Link
            href="/report"
            className="rounded-lg border border-white text-white font-semibold px-6 py-3 hover:bg-blue-600 transition-colors"
          >
            Registrar ocorrência
          </Link>
        </div>
      </div>
    </section>
  );
}
