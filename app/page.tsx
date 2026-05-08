import Link from "next/link";
import LandingHero from "@/components/LandingHero";
import LandingSection from "@/components/LandingSection";

export default function HomePage() {
  return (
    <main>
      <LandingHero />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <LandingSection
              icon="📍"
              title="Visualize no mapa"
              description="Acesse o mapa colaborativo e veja todas as ocorrências registradas na sua cidade em tempo real."
            />
            <LandingSection
              icon="✍️"
              title="Registre um problema"
              description="Encontrou um buraco ou uma via danificada? Registre com localização e foto para que todos saibam."
            />
            <LandingSection
              icon="✅"
              title="Confirme relatos"
              description="Reforce a veracidade de um relato confirmando ocorrências que você também observou."
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mapeamento colaborativo
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            O Via Nexo é mantido pela comunidade. Cada relato contribui para um mapa
            mais preciso, que ajuda gestores públicos e cidadãos a entender o real
            estado da malha viária urbana.
          </p>
          <Link
            href="/report"
            className="inline-block rounded-lg bg-blue-700 text-white font-semibold px-8 py-3 hover:bg-blue-800 transition-colors"
          >
            Contribuir agora
          </Link>
        </div>
      </section>

      <footer className="py-6 px-4 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
        Via Nexo — Mapeamento Urbano Colaborativo
      </footer>
    </main>
  );
}
