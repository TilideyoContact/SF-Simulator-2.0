import { useLocation } from 'wouter';
import { MessageSquare, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { useParcoursStore } from '@/lib/store';
import type { Scenario } from '@/lib/store';
import { useHistoryStore, formatHistoryDate } from '@/lib/historyStore';

const SCENARIOS = [
  {
    slug: 'feedback-recadrage',
    id: 'feedback_recadrage',
    label: 'Feedback / Recadrage',
    desc: 'Recadrer sans dégrader la relation',
    icon: MessageSquare,
    accent: '#000091',
    bg: 'rgba(0, 0, 145, 0.06)',
  },
  {
    slug: 'feedback-positif',
    id: 'feedback_positif',
    label: 'Feedback positif',
    desc: 'Reconnaître et valoriser',
    icon: TrendingUp,
    accent: '#18753c',
    bg: 'rgba(24, 117, 60, 0.06)',
  },
  {
    slug: 'decision-difficile',
    id: 'decision_difficile',
    label: 'Décision difficile',
    desc: 'Annoncer une décision non négociable',
    icon: AlertTriangle,
    accent: '#E1000F',
    bg: 'rgba(225, 0, 15, 0.06)',
  },
];

interface SideMenuProps {
  activeSlug?: string;
}

export function SideMenu({ activeSlug }: SideMenuProps) {
  const [, navigate] = useLocation();
  const resetParcours = useParcoursStore((s) => s.resetParcours);
  const setScenarioChoisi = useParcoursStore((s) => s.setScenarioChoisi);

  const handleScenarioClick = (slug: string, id: Scenario) => {
    resetParcours();
    setScenarioChoisi(id);
    navigate(`/scenario/${slug}`);
  };

  return (
    <nav
      data-testid="side-menu"
      className="hidden md:flex flex-col w-56 shrink-0 border-r border-[var(--dsfr-grey-925)] bg-white dark:bg-[var(--dsfr-grey-975)] overflow-y-auto"
    >
      <div className="p-4 border-b border-[var(--dsfr-grey-925)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--dsfr-grey-425)]">
          Choisir un scénario
        </p>
      </div>

      <div className="flex flex-col gap-1 p-2">
        {SCENARIOS.map((s) => {
          const isActive = activeSlug === s.slug;
          const Icon = s.icon;
          return (
            <button
              key={s.slug}
              data-testid={`sidemenu-${s.slug}`}
              onClick={() => handleScenarioClick(s.slug, s.id as Scenario)}
              className="w-full text-left rounded-lg px-3 py-3 transition-all group"
              style={{
                backgroundColor: isActive ? s.bg : 'transparent',
                border: isActive ? `1.5px solid ${s.accent}` : '1.5px solid transparent',
              }}
            >
              <div className="flex items-start gap-2">
                <Icon
                  className="w-4 h-4 mt-0.5 shrink-0 transition-colors"
                  style={{ color: isActive ? s.accent : 'var(--dsfr-grey-425)' }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ color: isActive ? s.accent : 'var(--foreground)' }}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-[var(--dsfr-grey-425)] mt-0.5 leading-tight">
                    {s.desc}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: s.accent }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <HistorySection />

      <div className="mt-auto p-4 border-t border-[var(--dsfr-grey-925)]">
        <p className="text-[10px] text-[var(--dsfr-grey-425)] leading-relaxed">
          Chaque scénario lance une nouvelle conversation indépendante.
        </p>
      </div>
    </nav>
  );
}

function HistorySection() {
  const entries = useHistoryStore((s) => s.entries);

  return (
    <div className="border-t border-[var(--dsfr-grey-925)] mt-2 pt-2">
      <div className="px-4 pt-2 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--dsfr-grey-425)]">
          Tes simulations
        </p>
      </div>

      {entries.length === 0 ? (
        <p
          data-testid="history-empty"
          className="px-4 pb-3 text-[10px] italic text-[var(--dsfr-grey-425)]"
        >
          Aucune simulation terminée
        </p>
      ) : (
        <ul className="flex flex-col gap-1 p-2" data-testid="history-list">
          {entries.map((e) => {
            const meta = SCENARIOS.find((s) => s.id === e.scenarioId);
            const Icon = meta?.icon ?? MessageSquare;
            const accent = meta?.accent ?? '#000091';
            return (
              <li
                key={e.id}
                data-testid={`history-entry-${e.id}`}
                className="rounded-lg px-3 py-2 cursor-default"
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight truncate" title={e.scenarioLabel}>
                      {e.scenarioLabel}
                    </p>
                    <p className="text-[10px] text-[var(--dsfr-grey-425)] mt-0.5 leading-tight">
                      {formatHistoryDate(e.timestamp)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold" style={{ color: accent }}>
                        {e.globalScore.toFixed(1)}/5
                      </span>
                      <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--dsfr-grey-925)] text-[var(--dsfr-grey-425)] font-medium">
                        Terminé
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { SCENARIOS };
