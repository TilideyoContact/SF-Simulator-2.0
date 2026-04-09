import { useParcoursStore } from '@/lib/store';
import { ChatCardSingle } from '@/components/ChatCard';
import { Button } from '@/components/ui/button';
import { getScenarioLabel, getDiscLabel, getRelationLabel, getEtatEspritLabel, getDifficultyStars, getTheoryContent, getPersonaDescription, getTourMax, getTypeCollabShortLabel } from '@/lib/helpers';
import { Play, BookOpen, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { persona, typeCollab, scenarioChoisi } = store;
  const difficultyStars = getDifficultyStars(persona.niveauDifficulte);
  const tourMax = getTourMax(scenarioChoisi, typeCollab);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-3 border-l-[3px] rounded-lg" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        <p className="font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>La simulation va commencer !</p>
        <div className="space-y-2 text-xs">
          <p><strong>Rappel du contexte :</strong></p>
          <ul className="space-y-1 list-none pl-0">
            <li>Scénario : <strong>{getScenarioLabel(scenarioChoisi)}</strong></li>
            <li>Collaborateur : <strong>{persona.prenomFictif}</strong>, {getTypeCollabShortLabel(typeCollab)}, profil <strong>{getDiscLabel(persona.disc)}</strong></li>
            <li>Relation : <strong>{getRelationLabel(persona.relation)}</strong> / État d'esprit : <strong>{getEtatEspritLabel(persona.etatEsprit)}</strong></li>
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
