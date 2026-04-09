import { useLocation } from 'wouter';
import franceTravailLogo from '@assets/image_1771580674143.png';
import { SideMenu, SCENARIOS } from '@/components/SideMenu';
import { MessageSquare, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'feedback-recadrage': MessageSquare,
  'feedback-positif': TrendingUp,
  'decision-difficile': AlertTriangle,
};

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="landing-page">
      <header className="border-b border-[var(--dsfr-grey-925)] bg-white dark:bg-[var(--dsfr-grey-975)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
          <img src={franceTravailLogo} alt="France Travail" className="h-8 w-auto" />
          <div className="h-8 w-px bg-[var(--dsfr-grey-925)]" />
          <div>
            <h1 className="font-bold text-sm text-[var(--dsfr-blue-france)] leading-tight">ChatFT SimuManager</h1>
            <p className="text-[11px] text-[var(--dsfr-grey-425)] font-medium">Entraînement managérial</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SideMenu />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
                Prépare tes entretiens managériaux
              </h2>
              <p className="text-sm text-[var(--dsfr-grey-425)] leading-relaxed">
                Sélectionne un scénario ci-dessous pour démarrer une simulation conversationnelle avec un collaborateur virtuel. Chaque scénario lance une conversation indépendante.
              </p>
            </div>

            <div className="space-y-3">
              {SCENARIOS.map((s) => {
                const Icon = ICON_MAP[s.slug] ?? MessageSquare;
                return (
                  <button
                    key={s.slug}
                    data-testid={`landing-scenario-${s.slug}`}
                    onClick={() => navigate(`/scenario/${s.slug}`)}
                    className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:shadow-sm transition-all group flex items-center gap-4"
                    style={{ '--hover-color': s.accent } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = s.accent;
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = s.bg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--dsfr-grey-850)';
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: s.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: s.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: s.accent }}>{s.label}</p>
                      <p className="text-xs text-[var(--dsfr-grey-425)] mt-0.5">{s.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--dsfr-grey-425)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
