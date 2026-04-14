import { useState, useEffect } from 'react';
import { useParcoursStore, getTourMaxFromDuree } from '@/lib/store';
import type { DureeEntretien } from '@/lib/store';
import { ChatCardSingle } from '@/components/ChatCard';
import { Button } from '@/components/ui/button';
import { getScenarioLabel, getDiscLabel, getRelationLabel, getDifficultyStars, getTheoryContent, getPersonaDescription, getTourMax, getTypeCollabShortLabel } from '@/lib/helpers';
import { Play, BookOpen, Star, ShieldCheck, Clock, Zap, Timer, Hourglass, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export function Step15PreSimulation() {
  const { choixPreSimulation, setChoixPreSimulation, nextStep, persona, scenarioChoisi } = useParcoursStore();

  const handleSelect = (id: string) => {
    setChoixPreSimulation(id as any);
    if (id === 'simulation') {
      setTimeout(() => {
        useParcoursStore.setState({ currentStep: 16 });
      }, 400);
    }
  };

  const desc = getPersonaDescription(persona.disc, persona.relation, persona.etatEsprit);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Prêt(e) à commencer ?
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">
          Pour le scénario <strong>"{getScenarioLabel(scenarioChoisi)}"</strong> avec {desc ? desc : 'ton collaborateur'}, que préfères-tu ?
        </p>
      </div>
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--dsfr-success-bg,#f6fef9)] border border-[var(--dsfr-success,#18753C)]20">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--dsfr-success, #18753C)' }} />
        <div className="text-xs text-[var(--dsfr-grey-425)]">
          <p className="font-bold text-[var(--dsfr-success, #18753C)] mb-0.5">Cadre sécurisé et anonyme</p>
          <p>Cet exercice est strictement confidentiel. Tes résultats ne sont visibles que par toi et ne constituent en aucun cas une évaluation hiérarchique. Installe-toi dans un endroit calme pour profiter pleinement de la simulation.</p>
        </div>
      </div>

      <ChatCardSingle
        selected={choixPreSimulation}
        onSelect={handleSelect}
        options={[
          { id: 'simulation', label: 'Passer à la simulation', subtitle: "Je veux m'entraîner directement", icon: <Play className="w-5 h-5" /> },
          { id: 'theorie', label: "D'abord des conseils théoriques", subtitle: 'Revoir les méthodes avant de pratiquer', icon: <BookOpen className="w-5 h-5" /> },
        ]}
      />
    </div>
  );
}

export function Step15bTheory() {
  const { scenarioChoisi, setChoixPreSimulation } = useParcoursStore();
  const theory = getTheoryContent(scenarioChoisi);
  const scenarioLabel = getScenarioLabel(scenarioChoisi);

  return (
    <div className="space-y-6">
      <button
        onClick={() => setChoixPreSimulation(null)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dsfr-blue-france)] hover:underline transition-colors py-1"
      >
        <span>←</span>
        Retour au choix
      </button>
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Conseils théoriques : {scenarioLabel}
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">{theory.introduction}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--dsfr-blue-france)' }}>
          Méthode {theory.method.name}
        </h4>
        <div className="space-y-2">
          {theory.method.steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-[var(--dsfr-grey-925)] bg-white">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: 'var(--dsfr-blue-france)' }}>
                {step.letter}
              </div>
              <div>
                <p className="font-bold text-sm">{step.title}</p>
                <p className="text-xs text-[var(--dsfr-grey-425)]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--dsfr-success, #18753C)' }}>
          Posture à adopter
        </h4>
        <ul className="space-y-1 text-sm">
          {theory.posture.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--dsfr-success, #18753C)] font-bold">+</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--dsfr-red-marianne)' }}>
          Erreurs à éviter
        </h4>
        <ul className="space-y-1 text-sm">
          {theory.erreurs.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--dsfr-red-marianne)] font-bold">x</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--dsfr-blue-france)' }}>
          Exemple concret
        </h4>
        <p className="text-sm italic text-[var(--dsfr-grey-425)]">{theory.exemple.situation}</p>
        <div className="p-3 rounded-lg border-l-[3px] bg-[var(--dsfr-success-bg,#f6fef9)]" style={{ borderLeftColor: 'var(--dsfr-success, #18753C)' }}>
          <p className="text-xs font-bold text-[var(--dsfr-success, #18753C)] mb-1">Bonne approche :</p>
          <p className="text-sm italic">"{theory.exemple.bonneApproche}"</p>
        </div>
        <div className="p-3 rounded-lg border-l-[3px] bg-[var(--dsfr-error-bg,#fff5f5)]" style={{ borderLeftColor: 'var(--dsfr-red-marianne)' }}>
          <p className="text-xs font-bold text-[var(--dsfr-red-marianne)] mb-1">Mauvaise approche :</p>
          <p className="text-sm italic">"{theory.exemple.mauvaiseApproche}"</p>
        </div>
      </div>

      <Button data-testid="button-launch-simulation" onClick={() => useParcoursStore.setState({ currentStep: 16 })} className="w-full">
        Je suis prêt(e), lancer la simulation
      </Button>
    </div>
  );
}

export function Step15c() {
  const store = useParcoursStore();
  const { persona, typeCollab, scenarioChoisi, simulation } = store;
  const difficultyStars = getDifficultyStars(persona.niveauDifficulte);
  const tourMax = simulation.tourMax || getTourMax(scenarioChoisi, typeCollab);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-3 border-l-[3px] rounded-lg" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        <p className="font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>La simulation va commencer !</p>
        <div className="space-y-2 text-xs">
          <p><strong>Rappel du contexte :</strong></p>
          <ul className="space-y-1 list-none pl-0">
            <li>Scénario : <strong>{getScenarioLabel(scenarioChoisi)}</strong></li>
            <li>Collaborateur : <strong>{persona.prenomFictif}</strong>, {getTypeCollabShortLabel(typeCollab)}, profil <strong>{getDiscLabel(persona.disc)}</strong></li>
            <li>Relation : <strong>{getRelationLabel(persona.relation)}</strong></li>
            <li className="flex items-center gap-1">
              Difficulté :
              {Array.from({ length: difficultyStars }, (_, i) => (
                <Star key={i} className="w-3 h-3 text-[var(--dsfr-warning)] fill-[var(--dsfr-warning)]" />
              ))}
            </li>
          </ul>
        </div>
        <p className="text-sm"><strong>Tu joues le rôle du manager. L'IA joue le rôle du collaborateur.</strong></p>
        <p className="text-sm">Écris ta première intervention comme si tu commençais l'entretien. L'échange durera environ <strong>{tourMax * 2} minutes</strong>.</p>
        <p className="text-xs text-[var(--dsfr-grey-425)] italic">À tout moment, tape "/fin" pour terminer la simulation.</p>
      </div>
    </div>
  );
}

const DUREE_OPTIONS: { id: DureeEntretien; label: string; range: string; tours: number; icon: React.ReactNode }[] = [
  { id: 'courte', label: 'Session courte', range: '5 – 10 min', tours: 4, icon: <Zap className="w-5 h-5" /> },
  { id: 'intermediaire', label: 'Session intermédiaire', range: '10 – 20 min', tours: 7, icon: <Timer className="w-5 h-5" /> },
  { id: 'longue', label: 'Session longue', range: '20 – 30 min', tours: 12, icon: <Hourglass className="w-5 h-5" /> },
];

export function Step27DureeEntretien() {
  const { dureeEntretien, setDureeEntretien, nextStep, profil, experience, objectifs, difficulte, scenarioChoisi, typeCollab, persona, mode } = useParcoursStore();
  const [recommendation, setRecommendation] = useState<{ recommended: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DureeEntretien>(dureeEntretien);

  useEffect(() => {
    setLoading(true);
    apiRequest('POST', '/api/recommend-duration', {
      scenario: scenarioChoisi,
      profil,
      experience,
      objectifs,
      difficulte,
      typeCollab,
      disc: persona.disc,
      mode,
    })
      .then(res => res.json())
      .then(data => {
        setRecommendation(data);
        if (!selected) {
          setSelected(data.recommended as DureeEntretien);
        }
      })
      .catch(() => {
        setRecommendation({ recommended: 'intermediaire', explanation: 'Durée standard recommandée.' });
        if (!selected) setSelected('intermediaire');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = () => {
    if (!selected) return;
    setDureeEntretien(selected);
    const tourMax = getTourMaxFromDuree(selected);
    useParcoursStore.setState((state) => ({
      simulation: { ...state.simulation, tourMax },
    }));
    nextStep();
  };

  const sliderIndex = selected === 'courte' ? 0 : selected === 'longue' ? 2 : 1;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Durée de l'entretien
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">
          Choisis la durée de ta simulation selon le temps dont tu disposes
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--dsfr-grey-425)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyse de ton profil en cours…
        </div>
      ) : recommendation && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border" style={{
          backgroundColor: 'rgba(0, 0, 145, 0.04)',
          borderColor: 'var(--dsfr-blue-france)',
        }}>
          <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--dsfr-blue-france)' }} />
          <div className="text-xs">
            <p className="font-bold mb-0.5" style={{ color: 'var(--dsfr-blue-france)' }}>
              Recommandation IA : {DUREE_OPTIONS.find(o => o.id === recommendation.recommended)?.label}
            </p>
            <p className="text-[var(--dsfr-grey-425)]">{recommendation.explanation}</p>
          </div>
        </div>
      )}

      <div className="px-2">
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={sliderIndex}
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            setSelected(DUREE_OPTIONS[idx].id);
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--dsfr-blue-france) ${sliderIndex * 50}%, var(--dsfr-grey-925) ${sliderIndex * 50}%)`,
            accentColor: 'var(--dsfr-blue-france)',
          }}
        />
        <div className="flex justify-between mt-1">
          {DUREE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={cn(
                'text-center px-1 py-1 rounded transition-colors',
                selected === opt.id ? 'font-bold' : 'text-[var(--dsfr-grey-425)]'
              )}
              style={selected === opt.id ? { color: 'var(--dsfr-blue-france)' } : undefined}
            >
              <span className="text-[10px] block">{opt.range}</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className={cn(
          'p-4 rounded-xl border-2 transition-all',
          recommendation?.recommended === selected ? 'border-[var(--dsfr-blue-france)] bg-[rgba(0,0,145,0.04)]' : 'border-[var(--dsfr-grey-850)] bg-white'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
              backgroundColor: 'rgba(0, 0, 145, 0.08)',
              color: 'var(--dsfr-blue-france)',
            }}>
              {DUREE_OPTIONS.find(o => o.id === selected)?.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{DUREE_OPTIONS.find(o => o.id === selected)?.label}</p>
              <p className="text-xs text-[var(--dsfr-grey-425)]">
                {DUREE_OPTIONS.find(o => o.id === selected)?.range} — {DUREE_OPTIONS.find(o => o.id === selected)?.tours} échanges
              </p>
            </div>
            {recommendation?.recommended === selected && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{
                backgroundColor: 'rgba(0, 0, 145, 0.1)',
                color: 'var(--dsfr-blue-france)',
              }}>
                Recommandé
              </span>
            )}
          </div>
        </div>
      )}

      <Button
        data-testid="button-confirm-duree"
        onClick={handleConfirm}
        disabled={!selected}
        className="w-full"
      >
        Confirmer la durée
      </Button>
    </div>
  );
}
