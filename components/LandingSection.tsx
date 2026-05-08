interface LandingSectionProps {
  icon: string;
  title: string;
  description: string;
}

export default function LandingSection({ icon, title, description }: LandingSectionProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}
