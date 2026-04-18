import { useEffect, useState } from 'react';
import { useParcoursStore } from '@/lib/store';
import { TypingIndicator } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { getScoreLabel } from '@/lib/helpers';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { BarChart3, CheckCircle, TrendingUp, Lightbulb, BookOpen, RefreshCw, MessageCircle, AlertTriangle, ArrowRight, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { generateSessionReport } from '@/lib/generateReportPdf';
import { useHistoryStore, type HistoryScenarioId } from '@/lib/historyStore';

const SCENARIO_LABELS: Record<string, string> = {
  feedback_recadrage: 'Feedback / Recadrage',
  feedback_positif: 'Feedback positif',
  decision_difficile: 'Décision difficile',
};

export function Step19Scores() {
  const store = useParcoursStore();
  const { simulation, scenarioChoisi, persona, typeCollab, setAnalyse, nextStep, analyse } = store;
  const [loading, setLoading] = useState(!analyse);

  useEffect(() => {
    if (analyse) return;
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    let finalGlobal = 3;
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
      finalGlobal = typeof data.global === 'number' ? data.global : 3;
    } catch {
      setAnalyse({
        clarte: 3,
        ecoute: 3,
        assertivite: 3,
        global: 3,
        pointsForts: [
          "Tu as engagé la conversation de manière professionnelle",
          "Ton approche était structurée et claire",
        ],
        axesProgression: [
          "Pense à reformuler davantage les propos de ton collaborateur pour montrer ton écoute",
        ],
        conseilCle: "L'écoute active est la clé : montre que tu comprends avant de proposer des solutions.",
      });
    } finally {
      setLoading(false);
      const sid = (scenarioChoisi || 'feedback_recadrage') as HistoryScenarioId;
      const finalAnalyse = useParcoursStore.getState().analyse;
      useHistoryStore.getState().addEntry({
        scenarioId: sid,
        scenarioLabel: SCENARIO_LABELS[sid] ?? sid,
        timestamp: Date.now(),
        globalScore: finalGlobal,
        messages: simulation.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
        persona: {
          disc: persona.disc,
          prenomFictif: persona.prenomFictif,
          relation: persona.relation,
          etatEsprit: persona.etatEsprit,
        },
        analyse: finalAnalyse,
      });
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
    { label: analyse.axe1Label || 'Clarté du discours', score: analyse.clarte, color: 'var(--dsfr-blue-france)' },
    { label: analyse.axe2Label || "Qualité d'écoute", score: analyse.ecoute, color: 'var(--dsfr-success)' },
    { label: analyse.axe3Label || 'Assertivité', score: analyse.assertivite, color: 'var(--dsfr-info)' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="w-6 h-6" style={{ color: 'var(--dsfr-blue-france)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Résultats de ta simulation</h3>
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
        Rappel : cet outil est un entraînement, pas une évaluation. Ce score est un repère personnel pour ta progression.
      </p>

      <Button data-testid="button-see-feedback" onClick={() => nextStep()} className="w-full">
        Voir le feedback détaillé
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
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Feedback détaillé</h3>
      </div>

      <div className="space-y-4">
        {analyse.impressionGenerale && (
          <div className="p-3 bg-[var(--dsfr-blue-france-light)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-blue-france)' }}>
              <BarChart3 className="w-4 h-4" />
              <span className="font-bold text-sm">Impression générale :</span>
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
            <span className="font-bold text-sm">Ce que tu as bien fait :</span>
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
            <span className="font-bold text-sm">Conseil clé :</span>
          </div>
          <p className="text-sm italic">{analyse.conseilCle}</p>
        </div>

        {analyse.prochaineEtape && (
          <div className="p-3 bg-[var(--dsfr-grey-975)] border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-success)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--dsfr-success)' }}>
              <ArrowRight className="w-4 h-4" />
              <span className="font-bold text-sm">Prochaine étape :</span>
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

const RESOURCE_CONTENT: Record<string, string[]> = {
  desc: [
    "La méthode DESC permet de structurer un feedback en 4 temps :",
    "D — Décrire les faits objectivement, sans jugement ni interprétation.",
    "E — Exprimer ton ressenti avec le « JE » (« je suis préoccupé » plutôt que « tu es négligent »).",
    "S — Spécifier ce que tu attends concrètement, avec un objectif mesurable.",
    "C — Conclure sur les conséquences positives si le changement est adopté.",
    "",
    "La méthode DEPAR complète DESC pour les situations plus complexes :",
    "DE — Décrire + Exprimer (identique à DESC).",
    "P — Proposer une solution ou une piste d'amélioration.",
    "A — Obtenir l'Accord du collaborateur sur le plan d'action.",
    "R — Renforcer en valorisant l'engagement pris.",
  ],
  ecoute: [
    "L'écoute active repose sur 4 piliers :",
    "1. Silence attentif — Laisse l'autre finir avant de répondre. Compte 2 secondes après qu'il a terminé.",
    "2. Reformulation — Reprends l'essentiel avec tes mots : « Si je comprends bien, tu dis que... »",
    "3. Questions ouvertes — Privilégie « Comment vois-tu les choses ? » plutôt que « Tu es d'accord ? »",
    "4. Validation émotionnelle — Nomme ce que tu perçois : « Je sens que c'est important pour toi. »",
    "",
    "Astuce : la reformulation montre que tu as écouté AVANT de donner ton avis. C'est ce qui crée la confiance.",
  ],
  influence: [
    "Entre pairs, il n'y a pas de levier hiérarchique. L'influence repose sur :",
    "",
    "Méthode « Écouter puis JE » :",
    "1. Écouter sincèrement la position de l'autre sans l'interrompre.",
    "2. Reformuler pour montrer que tu as compris.",
    "3. Exprimer ta position avec le « JE » : « De mon côté, je constate que... »",
    "",
    "Principes PPC (Position, Proposition, Conséquence) :",
    "P — Énonce ta position clairement.",
    "P — Fais une proposition concrète (gagnant-gagnant).",
    "C — Décris les conséquences positives pour les deux parties.",
    "",
    "Clé : ne cherche pas à « gagner » mais à trouver un accord bilatéral.",
  ],
  assert: [
    "La posture assertive se situe entre passivité et agressivité :",
    "",
    "Grille OK+/OK+ (Analyse Transactionnelle) :",
    "• OK+/OK+ = « Je suis OK, tu es OK » → posture idéale, respect mutuel.",
    "• OK+/OK- = « J'ai raison, tu as tort » → dominance, à éviter.",
    "• OK-/OK+ = « Tu as raison, je m'écrase » → soumission, inefficace.",
    "• OK-/OK- = « On n'y arrivera pas » → résignation, toxique.",
    "",
    "La règle du JE :",
    "Remplace chaque « TU » accusateur par un « JE » descriptif :",
    "❌ « Tu ne fais jamais attention » → ✅ « Je constate que le dossier contenait des erreurs »",
    "❌ « Tu es toujours en retard » → ✅ « J'ai besoin que les délais soient respectés »",
  ],
  merci: [
    "La méthode MERCI structure un feedback positif impactant :",
    "M — Mentionner le fait précis (pas une généralité).",
    "E — Exprimer l'Émotion que ça a suscité chez toi.",
    "R — Relier à un Résultat concret ou un impact collectif.",
    "C — Conclure sur la Compétence démontrée.",
    "I — Inviter à continuer (encouragement vers l'avenir).",
    "",
    "Complément ASAP+D :",
    "A — Aussi vite que possible (ne pas attendre l'entretien annuel).",
    "S — Sincère (pas de compliment générique).",
    "A — Adapté au profil (certains préfèrent le privé, d'autres le collectif).",
    "P — Précis (un fait, une date, un livrable).",
    "D — Dosé (ni trop rare, ni inflationniste).",
  ],
  signes: [
    "Les signes de reconnaissance conditionnels valorisent un COMPORTEMENT, pas la personne :",
    "",
    "✅ Conditionnel positif : « Ton analyse du dossier X était très pertinente » → encourage la répétition.",
    "❌ Inconditionnel vague : « Tu es génial » → ne dit rien sur ce qu'il faut reproduire.",
    "",
    "Pour valoriser l'impact collectif :",
    "1. Nomme la contribution individuelle ET son effet sur l'équipe.",
    "2. Exemple : « Grâce à ta préparation, toute l'équipe a pu avancer plus vite sur le projet. »",
    "3. Encourage le partage de bonnes pratiques entre collègues.",
    "",
    "Piège à éviter : ne comparer jamais avec un autre collaborateur (« Pourquoi les autres ne font pas comme toi ? »).",
  ],
  projection: [
    "Le feedback constructif selon Cegos suit 3 temps :",
    "",
    "1. Ancrer dans le passé — « Voici ce que j'ai observé de positif... » (faits précis).",
    "2. Valoriser le présent — « Ce que ça apporte concrètement... » (impact mesurable).",
    "3. Projeter vers l'avenir — « Comment tu pourrais aller encore plus loin... » (développement).",
    "",
    "L'objectif est de transformer le feedback positif en levier de progression :",
    "• Propose un nouveau défi ou une responsabilité élargie.",
    "• Demande au collaborateur comment IL veut progresser.",
    "• Fixe un point de suivi pour accompagner la montée en compétence.",
  ],
  annonce: [
    "Annoncer une décision difficile suit un protocole précis :",
    "",
    "1. Nommer la décision dès les premières phrases — pas de « small talk » excessif.",
    "   Exemple : « Je te reçois pour t'informer que... »",
    "2. Donner le cadre — « Cette décision vient de... » (direction, réglementation, arbitrage).",
    "3. Utiliser le « JE » pour assumer — « J'assume cette décision » plutôt que « on m'a demandé de... »",
    "",
    "Méthode Écouter puis JE après l'annonce :",
    "• Laisse le collaborateur réagir SANS l'interrompre.",
    "• Reformule son émotion : « Je comprends que c'est difficile à entendre. »",
    "• Réaffirme la décision calmement : « La décision est prise, et je suis là pour t'accompagner. »",
  ],
  emotion: [
    "Face à une émotion forte après une annonce difficile :",
    "",
    "Vocabulaire du ressenti (à utiliser) :",
    "• « Je perçois que tu es déçu / en colère / inquiet. »",
    "• « C'est normal de ressentir ça. »",
    "• « Prends le temps dont tu as besoin. »",
    "",
    "Vocabulaire à éviter :",
    "• « Calme-toi » → invalide l'émotion.",
    "• « C'est pas si grave » → minimise.",
    "• « Je comprends » (sans reformulation) → sonne creux.",
    "",
    "Positions de vie face à l'émotion :",
    "Reste en OK+/OK+ : « Ta réaction est légitime ET la décision est maintenue. »",
    "Ne négocie JAMAIS le non-négociable, mais accompagne l'acceptation.",
  ],
  suivi: [
    "Après une annonce difficile, le suivi est essentiel :",
    "",
    "1. Point de suivi rapide (48-72h) :",
    "   • « Comment tu te sens depuis notre échange ? »",
    "   • Vérifie que le collaborateur a les informations nécessaires.",
    "",
    "2. Plan d'accompagnement :",
    "   • Identifie les besoins concrets (formation, réorganisation, soutien RH).",
    "   • Propose un calendrier de points réguliers.",
    "",
    "3. Perspectives :",
    "   • Même dans une décision difficile, ouvre des perspectives positives.",
    "   • « Voici ce sur quoi on peut travailler ensemble désormais. »",
    "   • Maintiens le lien professionnel et la confiance.",
  ],
  complex: [
    "Tu as obtenu un excellent score ! Pour continuer à progresser :",
    "",
    "• Augmente la difficulté du persona : profil DISC « Dominant », relation tendue, état d'esprit « agacé ».",
    "• Teste un scénario différent pour sortir de ta zone de confort.",
    "• Essaie avec un type de collaborateur différent (pairs, N+1).",
    "",
    "Les managers expérimentés gagnent à s'entraîner sur les cas limites — c'est là que les vrais réflexes se construisent.",
  ],
  replay: [
    "Rejouer le même scénario te permet de :",
    "",
    "• Comparer tes scores d'une session à l'autre.",
    "• Tester des approches différentes (plus directe, plus empathique, etc.).",
    "• Identifier tes réflexes récurrents et les ajuster.",
    "",
    "Conseil : avant de rejouer, relis les axes de progression identifiés dans ton analyse.",
  ],
};

export function Step21Ressources() {
  const { analyse, nextStep, scenarioChoisi, typeCollab, resetToPersona } = useParcoursStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (!analyse) return null;

  const resources: Array<{ id: string; label: string; subtitle: string; icon: React.ReactNode }> = [];
  const sc = scenarioChoisi || 'feedback_recadrage';
  const tc = typeCollab || 'agent';

  if (sc === 'feedback_recadrage') {
    if (analyse.clarte <= 3) resources.push({ id: 'desc', label: 'Fiche DESC + DEPAR', subtitle: 'Structurer un feedback factuel sans jugement (Smartpocket Cegos)', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'ecoute', label: 'Tuto écoute active + reformulation', subtitle: 'Techniques pour montrer que tu comprends avant de proposer', icon: <BookOpen className="w-5 h-5" /> });
    if (tc === 'pairs' && analyse.assertivite <= 3) resources.push({ id: 'influence', label: 'Méthode Écouter puis JE + principes PPC', subtitle: 'Influence entre pairs sans rapport hiérarchique', icon: <BookOpen className="w-5 h-5" /> });
    if (tc !== 'pairs' && analyse.assertivite <= 3) resources.push({ id: 'assert', label: 'Fiche OK+/OK+ et posture assertive', subtitle: 'Positions de vie et règle du JE pour un cadrage bienveillant', icon: <BookOpen className="w-5 h-5" /> });
  } else if (sc === 'feedback_positif') {
    if (analyse.clarte <= 3) resources.push({ id: 'merci', label: 'Méthode MERCI + ASAP+D', subtitle: 'Structurer un feedback positif précis et sincère', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'signes', label: 'Signes de reconnaissance conditionnels', subtitle: 'Valoriser l\'impact collectif, pas juste l\'individu', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.assertivite <= 3) resources.push({ id: 'projection', label: 'Fiche feedback constructif Cegos', subtitle: 'Projeter vers l\'avenir après la valorisation', icon: <BookOpen className="w-5 h-5" /> });
  } else if (sc === 'decision_difficile') {
    if (analyse.clarte <= 3) resources.push({ id: 'annonce', label: 'Fiche annonce décision + Écouter puis JE', subtitle: 'Nommer la décision clairement sans tourner autour', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.ecoute <= 3) resources.push({ id: 'emotion', label: 'Vocabulaire du ressenti + Positions de vie', subtitle: 'Accueillir l\'émotion sans la nier ni négocier le non-négociable', icon: <BookOpen className="w-5 h-5" /> });
    if (analyse.assertivite <= 3) resources.push({ id: 'suivi', label: 'Fiche suivi post-décision', subtitle: 'Accompagnement, perspectives et suivi après une annonce difficile', icon: <BookOpen className="w-5 h-5" /> });
  }

  if (analyse.global >= 4) resources.push({ id: 'complex', label: 'Scénario plus complexe', subtitle: 'Teste-toi avec un profil plus exigeant', icon: <TrendingUp className="w-5 h-5" /> });
  resources.push({ id: 'replay', label: 'Rejouer ce scénario', subtitle: 'Comparer ta progression', icon: <RefreshCw className="w-5 h-5" /> });

  const handleResourceClick = (id: string) => {
    if (id === 'replay') {
      resetToPersona();
      return;
    }
    if (id === 'complex') {
      resetToPersona();
      return;
    }
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ressources pour aller plus loin</h3>
      </div>

      <div className="space-y-2">
        {resources.map((r) => {
          const isExpanded = expandedId === r.id;
          const content = RESOURCE_CONTENT[r.id];
          const isAction = r.id === 'replay' || r.id === 'complex';

          return (
            <div key={r.id} className="border border-[var(--dsfr-grey-925)] rounded-lg overflow-hidden transition-colors hover:border-[var(--dsfr-blue-france)]">
              <button
                onClick={() => handleResourceClick(r.id)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card text-sm text-left hover:bg-[var(--dsfr-blue-france-light)] transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center bg-[var(--dsfr-blue-france-medium)] text-[var(--dsfr-blue-france)]">
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs text-[var(--dsfr-grey-425)]">{r.subtitle}</div>
                </div>
                {!isAction && (
                  <div className="flex-shrink-0 text-[var(--dsfr-grey-425)]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
                {isAction && (
                  <div className="flex-shrink-0 text-[var(--dsfr-blue-france)]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
              {isExpanded && content && (
                <div className="px-4 py-4 bg-[var(--dsfr-blue-france-light)] border-t border-[var(--dsfr-grey-925)]">
                  <div className="space-y-1.5 text-sm text-foreground leading-relaxed">
                    {content.map((line, i) => (
                      <p key={i} className={line === '' ? 'h-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button data-testid="button-continue-feedback" onClick={() => nextStep()} className="w-full">
        Continuer
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          const store = useParcoursStore.getState();
          generateSessionReport({
            scenario: store.scenarioChoisi || 'feedback_recadrage',
            typeCollab: store.typeCollab || 'agent',
            profil: store.profil || 'mp',
            disc: store.persona.disc || 'stable',
            relation: store.persona.relation || 3,
            etatEsprit: store.persona.etatEsprit || 'neutre',
            mode: store.mode || 'rapide',
            analyse: store.analyse!,
            resources: resources.filter(r => r.id !== 'replay' && r.id !== 'complex').map(r => ({
              label: r.label,
              subtitle: r.subtitle,
            })),
          });
        }}
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger mon rapport de session (PDF)
      </Button>
    </div>
  );
}
