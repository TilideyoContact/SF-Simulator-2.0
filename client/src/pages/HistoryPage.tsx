import { useLocation } from 'wouter';
import { ArrowLeft, MessageSquare, TrendingUp, AlertTriangle, Lock } from 'lucide-react';
import { useHistoryStore, formatHistoryDate } from '@/lib/historyStore';
import { ChatBubble } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { SideMenu } from '@/components/SideMenu';
import { getDiscLabel, getRelationLabel, getEtatEspritLabel } from '@/lib/helpers';
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

        <footer className="border-t border-[var(--dsfr-grey-925)] bg-[var(--dsfr-grey-975)] px-6 py-3 text-center">
          <p className="text-xs italic text-[var(--dsfr-grey-425)]">
            Chat indisponible — cette simulation est terminée.
          </p>
        </footer>
      </main>
    </div>
  );
}
