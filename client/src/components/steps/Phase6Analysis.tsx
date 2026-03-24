import { useEffect, useState } from 'react';
import { useParcoursStore } from '@/lib/store';
import { TypingIndicator } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { getScoreLabel } from '@/lib/helpers';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { BarChart3, CheckCircle, TrendingUp, Lightbulb, BookOpen, RefreshCw, MessageCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function Step19Scores() {
  const store = useParcoursStore();
  const { simulation, scenarioChoisi, persona, typeCollab, setAnalyse, nextStep, analyse } = store;
  const [loading, setLoading] = useState(!analyse);

  useEffect(() => {
    if (analyse) return;
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await apiRequest('POST', '/api/simulation/analyze', {
        sessionId: store.sessionId,
        messages: simulation.messages,
        scenario: scenarioChoisi,
        typeCollab,
        profil: store.profil,
      });
      const data = await res.json();
      setAnalyse(data);
    } catch {
      setAnalyse({
        clarte: 3,
        ecoute: 3,
        assertivite: 3,
        global: 3,
        pointsForts: [
          "Vous avez engage la conversation de maniere professionnelle",
          "Votre approche etait structuree et claire",
        ],
        axesProgression: [
          "Pensez a reformuler davantage les propos de votre collaborateur pour montrer votre ecoute",
        ],
        conseilCle: "L'ecoute active est la cle : montrez que vous comprenez avant de proposer des solutions.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <TypingIndicator />
      </div>
    );
  }

  if (!analyse) return null;

  const axes = [
    { label: analyse.axe1Label || 'Clarte du discours', score: analyse.clarte, color: 'var(--dsfr-blue-france)' },
    { label: analyse.axe2Label || "Qualite d'ecoute", score: analyse.ecoute, color: 'var(--dsfr-success)' },
    { label: analyse.axe3Label || 'Assertivite', score: analyse.assertivite, color: 'var(--dsfr-info)' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="w-6 h-6" style={{ color: 'var(--dsfr-blue-france)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Resultats de votre simulation</h3>
        </div>
      </div>

      <div className="space-y-3">
        {axes.map((ax) => (
          <div key={ax.label} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>{ax.label}</span>
              <span className="font-bold">{ax.score}/5 - {getScoreLabel(ax.score)}</span>
            </div>
            <div className="h-2.5 bg-[var(--dsfr-grey-925)] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000 rounded-full"
                style={{ width: `${(ax.score / 5) * 100}%`, backgroundColor: ax.color }}
              />
            </div>
          </div>
        ))}
        <div className="pt-3 border-t border-[var(--dsfr-grey-925)]">
          <div className="flex justify-between text-sm">
            <span className="font-bold">Score global</span>
            <span className="font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>{analyse.global.toFixed(1)}/5 - {getScoreLabel(analyse.global)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--dsfr-grey-425)] italic text-center">
        Rappel : cet outil est un entrainement, pas une evaluation. Ce score est un repere personnel pour votre progression.
      </p>

      <Button data-testid="button-see-feedback" onClick={() => nextStep()} className="w-full">
        Voir le feedback detaille
      </Button>
    </div>
  );
}

export function Step20Feedback() {
  const { analyse, nextStep } = useParcoursStore();
  if (!analyse) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Feedback detaille</h3>
      </div>

      <div className="space-y-4">
        {analyse.impressionGenerale && (
          <div className="p-3 bg-[var(--dsfr-blue-france-light)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-blue-france)' }}>
              <BarChart3 className="w-4 h-4" />
              <span className="font-bold text-sm">Impression generale :</span>
            </div>
            <p className="text-sm">{analyse.impressionGenerale}</p>
          </div>
        )}

        {analyse.ressentiCollaborateur && (
          <div className="p-3 bg-[var(--dsfr-grey-975)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-warning)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-warning)' }}>
              <MessageCircle className="w-4 h-4" />
              <span className="font-bold text-sm">Ce que le collaborateur a ressenti :</span>
            </div>
            <p className="text-sm italic">{analyse.ressentiCollaborateur}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2" style={{ color: 'var(--dsfr-success)' }}>
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold text-sm">Ce que vous avez bien fait :</span>
          </div>
          <ul className="space-y-1.5 text-sm pl-1">
            {analyse.pointsForts.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-success)' }}>+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2" style={{ color: 'var(--dsfr-info)' }}>
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold text-sm">Axes de progression :</span>
          </div>
          <ul className="space-y-1.5 text-sm pl-1">
            {analyse.axesProgression.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-info)' }}>&#8250;</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {analyse.vigilances && analyse.vigilances !== "Aucune vigilance particulière" && (
          <div className="p-3 bg-[var(--dsfr-grey-975)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-error, #e1000f)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-error, #e1000f)' }}>
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold text-sm">Vigilances relationnelles :</span>
            </div>
            <p className="text-sm">{analyse.vigilances}</p>
          </div>
        )}

        <div className="p-3 bg-[var(--dsfr-info-light)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-info)' }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-warning)' }}>
            <Lightbulb className="w-4 h-4" />
            <span className="font-bold text-sm">Conseil cle :</span>
          </div>
          <p className="text-sm italic">{analyse.conseilCle}</p>
        </div>

        {analyse.prochaineEtape && (
          <div className="p-3 bg-[var(--dsfr-grey-975)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-success)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-success)' }}>
              <ArrowRight className="w-4 h-4" />
              <span className="font-bold text-sm">Prochaine etape :</span>
            </div>
            <p className="text-sm">{analyse.prochaineEtape}</p>
          </div>
        )}
      </div>

      <Button data-testid="button-see-resources" onClick={() => nextStep()} className="w-full">
        Voir les ressources
      </Button>
    </div>
  );
}

export function Step21Ressources() {
  const { analyse, nextStep, scenarioChoisi, typeCollab } = useParcoursStore();
  if (!analyse) return null;

  const resources: Array<{ id: string; label: string; subtitle: string; icon: React.ReactNode }> = [];
  const sc = scenarioChoisi || 'feedback_recadrage';
  const tc = typeCollab || 'agent';

  // Ressources conditionnelles croisées axe×scénario (BLOC D2 section 7)
  if (sc === 'feedback_recadrage') {
    if (analyse.clarte <= 3) resources.push({ id: 'desc', label: 'Fiche DESC + DEPAR', subtitle: 'Structurer un feedback factuel sans jugement (Smartpocket Cegos)', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'ecoute', label: 'Tuto ecoute active + reformulation', subtitle: 'Techniques pour montrer que vous comprenez avant de proposer', icon: <BookOpen className="w-5 h-5" /> });
    if (tc === 'pairs' && analyse.assertivite <= 3) resources.push({ id: 'influence', label: 'Methode Ecouter puis JE + principes PPC', subtitle: 'Influence entre pairs sans rapport hierarchique', icon: <BookOpen className="w-5 h-5" /> });
    if (tc !== 'pairs' && analyse.assertivite <= 3) resources.push({ id: 'assert', label: 'Fiche OK+/OK+ et posture assertive', subtitle: 'Positions de vie et regle du JE pour un cadrage bienveillant', icon: <BookOpen className="w-5 h-5" /> });
  } else if (sc === 'feedback_positif') {
    if (analyse.clarte <= 3) resources.push({ id: 'merci', label: 'Methode MERCI + ASAP+D', subtitle: 'Structurer un feedback positif precis et sincere', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'signes', label: 'Signes de reconnaissance conditionnels', subtitle: 'Valoriser l\'impact collectif, pas juste l\'individu', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.assertivite <= 3) resources.push({ id: 'projection', label: 'Fiche feedback constructif Cegos', subtitle: 'Projeter vers l\'avenir apres la valorisation', icon: <BookOpen className="w-5 h-5" /> });
  } else if (sc === 'decision_difficile') {
    if (analyse.clarte <= 3) resources.push({ id: 'annonce', label: 'Fiche annonce decision + Ecouter puis JE', subtitle: 'Nommer la decision clairement sans tourner autour', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'emotion', label: 'Vocabulaire du ressenti + Positions de vie', subtitle: 'Accueillir l\'emotion sans la nier ni negocier le non-negociable', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.assertivite <= 3) resources.push({ id: 'suivi', label: 'Fiche suivi post-decision', subtitle: 'Accompagnement, perspectives et suivi apres une annonce difficile', icon: <BookOpen className="w-5 h-5" /> });
  }

  if (analyse.global >= 4) resources.push({ id: 'complex', label: 'Scenario plus complexe', subtitle: 'Testez-vous avec un profil plus exigeant', icon: <TrendingUp className="w-5 h-5" /> });
  resources.push({ id: 'replay', label: 'Rejouer ce scenario', subtitle: 'Comparer votre progression', icon: <RefreshCw className="w-5 h-5" /> });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ressources pour aller plus loin</h3>
      </div>

      <div className="space-y-2">
        {resources.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-4 py-3 bg-card border border-[var(--dsfr-grey-925)] rounded-lg text-sm hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)] transition-colors cursor-pointer"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center bg-[var(--dsfr-blue-france-medium)] text-[var(--dsfr-blue-france)]">
              {r.icon}
            </div>
            <div>
              <div className="font-bold text-sm">{r.label}</div>
              <div className="text-xs text-[var(--dsfr-grey-425)]">{r.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <Button data-testid="button-continue-feedback" onClick={() => nextStep()} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
