import { useLocation } from 'wouter';
import { ArrowLeft, MessageSquare, TrendingUp, AlertTriangle, Lock, BarChart3, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { useHistoryStore, formatHistoryDate } from '@/lib/historyStore';
import { ChatBubble } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { SideMenu } from '@/components/SideMenu';
import { getDiscLabel, getRelationLabel, getEtatEspritLabel, getScoreLabel } from '@/lib/helpers';
import type { DiscProfil, Relation, EtatEsprit } from '@/lib/store';

const SCENARIO_META: Record<string, { icon: any; accent: string; bg: string }> = {
  feedback_recadrage: { icon: MessageSquare, accent: '#000091', bg: 'rgba(0, 0, 145, 0.06)' },
  feedback_positif: { icon: TrendingUp, accent: '#18753c', bg: 'rgba(24, 117, 60, 0.06)' },
  decision_difficile: { icon: AlertTriangle, accent: '#E1000F', bg: 'rgba(225, 0, 15, 0.06)' },
};

interface HistoryPageProps {
  id: string;
}

export default function HistoryPage({ id }: HistoryPageProps) {
  const [, navigate] = useLocation();
  const entry = useHistoryStore((s) => s.entries.find((e) => e.id === id));

  if (!entry) {
    return (
      <div className="flex h-screen">
        <SideMenu />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
              Simulation introuvable
            </h2>
            <p className="text-sm text-[var(--dsfr-grey-425)]">
              Cette simulation n'est plus disponible dans ton historique.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const meta = SCENARIO_META[entry.scenarioId] ?? SCENARIO_META.feedback_recadrage;
  const Icon = meta.icon;
  const analyse = entry.analyse;
  const axes = analyse
    ? [
        { label: analyse.axe1Label || 'Clarté du discours', score: analyse.clarte, color: 'var(--dsfr-blue-france)' },
        { label: analyse.axe2Label || "Qualité d'écoute", score: analyse.ecoute, color: 'var(--dsfr-success)' },
        { label: analyse.axe3Label || 'Assertivité', score: analyse.assertivite, color: 'var(--dsfr-info)' },
      ]
    : [];

  return (
    <div className="flex h-screen">
      <SideMenu />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header
          className="border-b border-[var(--dsfr-grey-925)] px-6 py-4 flex items-center gap-3 bg-white"
          style={{ backgroundColor: meta.bg }}
        >
          <Button
            data-testid="button-history-back"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Icon className="w-5 h-5 shrink-0" style={{ color: meta.accent }} />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate" style={{ color: meta.accent }}>
              {entry.scenarioLabel}
            </h1>
            <p className="text-xs text-[var(--dsfr-grey-425)]">
              {formatHistoryDate(entry.timestamp)} ·{' '}
              <span className="font-bold" style={{ color: meta.accent }}>
                {entry.globalScore.toFixed(1)}/5
              </span>{' '}
              · Collaborateur :{' '}
              <strong className="text-foreground">{entry.persona.prenomFictif}</strong>
              {entry.persona.disc && (
                <> ({getDiscLabel(entry.persona.disc as DiscProfil)})</>
              )}
            </p>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="rounded-lg border border-[var(--dsfr-grey-925)] bg-[var(--dsfr-grey-975)] p-3 text-xs text-[var(--dsfr-grey-425)] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Conversation archivée — lecture seule</p>
                  <p className="mt-0.5">
                    Tu ne peux pas continuer cette simulation. Lance un nouveau scénario depuis le
                    menu pour démarrer une nouvelle conversation.
                  </p>
                  {entry.persona.relation !== null && (
                    <p className="mt-0.5">
                      Relation : <strong>{getRelationLabel(entry.persona.relation as Relation)}</strong> ·
                      État d'esprit :{' '}
                      <strong>{getEtatEspritLabel(entry.persona.etatEsprit as EtatEsprit)}</strong>
                    </p>
                  )}
                </div>
              </div>

              {entry.messages.length === 0 ? (
                <p className="text-sm italic text-[var(--dsfr-grey-425)] text-center py-8">
                  Aucun message enregistré pour cette simulation.
                </p>
              ) : (
                entry.messages.map((m, i) => (
                  <ChatBubble
                    key={i}
                    role={m.role === 'manager' ? 'user' : 'bot'}
                    animate={false}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </ChatBubble>
                ))
              )}
            </div>
          </div>

          <aside
            data-testid="panel-history-results"
            className="hidden lg:flex w-80 xl:w-96 shrink-0 border-l border-[var(--dsfr-grey-925)] bg-[var(--dsfr-grey-975)] overflow-y-auto flex-col"
          >
            <div className="px-5 py-4 border-b border-[var(--dsfr-grey-925)] bg-white">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: meta.accent }} />
                <h2 className="text-sm font-bold" style={{ color: meta.accent }}>
                  Résultats de la simulation
                </h2>
              </div>
            </div>

            {!analyse ? (
              <div className="p-5 text-xs text-[var(--dsfr-grey-425)] italic">
                Aucun résultat enregistré pour cette simulation.
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <section className="space-y-2.5">
                  {axes.map((ax) => (
                    <div key={ax.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium gap-2">
                        <span className="truncate">{ax.label}</span>
                        <span className="font-bold shrink-0">{ax.score}/5</span>
                      </div>
                      <div className="h-2 bg-[var(--dsfr-grey-925)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(ax.score / 5) * 100}%`, backgroundColor: ax.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 mt-1 border-t border-[var(--dsfr-grey-925)] flex justify-between text-xs">
                    <span className="font-bold">Score global</span>
                    <span className="font-bold" style={{ color: meta.accent }}>
                      {analyse.global.toFixed(1)}/5 — {getScoreLabel(analyse.global)}
                    </span>
                  </div>
                </section>

                {analyse.impressionGenerale && (
                  <section className="p-3 bg-white border-l-[3px] rounded-sm" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--dsfr-blue-france)' }}>
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Impression générale</span>
                    </div>
                    <p className="text-xs leading-relaxed">{analyse.impressionGenerale}</p>
                  </section>
                )}

                {analyse.ressentiCollaborateur && (
                  <section className="p-3 bg-white border-l-[3px] rounded-sm" style={{ borderLeftColor: 'var(--dsfr-warning)' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--dsfr-warning)' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Ressenti du collaborateur</span>
                    </div>
                    <p className="text-xs italic leading-relaxed">{analyse.ressentiCollaborateur}</p>
                  </section>
                )}

                {analyse.pointsForts && analyse.pointsForts.length > 0 && (
                  <section className="space-y-1.5">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--dsfr-success)' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Ce que tu as bien fait</span>
                    </div>
                    <ul className="space-y-1 text-xs pl-1">
                      {analyse.pointsForts.map((p, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-success)' }}>+</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {analyse.axesProgression && analyse.axesProgression.length > 0 && (
                  <section className="space-y-1.5">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--dsfr-info)' }}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Axes de progression</span>
                    </div>
                    <ul className="space-y-1 text-xs pl-1">
                      {analyse.axesProgression.map((a, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-info)' }}>›</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {analyse.vigilances && analyse.vigilances !== 'Aucune vigilance particulière' && (
                  <section className="p-3 bg-white border-l-[3px] rounded-sm" style={{ borderLeftColor: 'var(--dsfr-error, #e1000f)' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--dsfr-error, #e1000f)' }}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Vigilances</span>
                    </div>
                    <p className="text-xs leading-relaxed">{analyse.vigilances}</p>
                  </section>
                )}

                {analyse.conseilCle && (
                  <section className="p-3 bg-white border-l-[3px] rounded-sm" style={{ borderLeftColor: 'var(--dsfr-info)' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--dsfr-warning)' }}>
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Conseil clé</span>
                    </div>
                    <p className="text-xs italic leading-relaxed">{analyse.conseilCle}</p>
                  </section>
                )}

                {analyse.prochaineEtape && (
                  <section className="p-3 bg-white border-l-[3px] rounded-sm" style={{ borderLeftColor: 'var(--dsfr-success)' }}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--dsfr-success)' }}>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs">Prochaine étape</span>
                    </div>
                    <p className="text-xs leading-relaxed">{analyse.prochaineEtape}</p>
                  </section>
                )}
              </div>
            )}
          </aside>
        </div>

        <footer className="border-t border-[var(--dsfr-grey-925)] bg-[var(--dsfr-grey-975)] px-6 py-3 text-center">
          <p className="text-xs italic text-[var(--dsfr-grey-425)]">
            Chat indisponible — cette simulation est terminée.
          </p>
        </footer>
      </main>
    </div>
  );
}
