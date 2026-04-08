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
    } else {
      setTimeout(() => nextStep(), 400);
    }
  };

  const desc = getPersonaDescription(persona.disc, persona.relation, persona.etatEsprit);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Pret(e) a commencer ?
        </h3>
        <p className="text-sm text-[var(--dsfr-grey-425)] mt-1">
          Pour le scenario <strong>"{getScenarioLabel(scenarioChoisi)}"</strong> avec {desc ? desc : 'ton collaborateur'}, que preferes-tu ?
        </p>
      </div>
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--dsfr-success-bg,#f6fef9)] border border-[var(--dsfr-success,#18753C)]20">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--dsfr-success, #18753C)' }} />
        <div className="text-xs text-[var(--dsfr-grey-425)]">
          <p className="font-bold text-[var(--dsfr-success, #18753C)] mb-0.5">Cadre securise et anonyme</p>
          <p>Cet exercice est strictement confidentiel. Tes resultats ne sont visibles que par toi et ne constituent en aucun cas une evaluation hierarchique. Installe-toi dans un endroit calme pour profiter pleinement de la simulation.</p>
        </div>
      </div>

      <ChatCardSingle
        selected={choixPreSimulation}
        onSelect={handleSelect}
        options={[
          { id: 'simulation', label: 'Passer a la simulation', subtitle: "Je veux m'entrainer directement", icon: <Play className="w-5 h-5" /> },
          { id: 'theorie', label: "D'abord des conseils theoriques", subtitle: 'Revoir les methodes avant de pratiquer', icon: <BookOpen className="w-5 h-5" /> },
        ]}
      />
    </div>
  );
}

export function Step15bTheory() {
  const { scenarioChoisi } = useParcoursStore();
  const theory = getTheoryContent(scenarioChoisi);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          {theory.title}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-bold text-[var(--dsfr-grey-425)] uppercase tracking-wider">Methodes :</p>
          <ul className="space-y-1.5 text-sm">
            {theory.methods.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-blue-france)' }}>&#8250;</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-[var(--dsfr-grey-425)] uppercase tracking-wider">Conseils pratiques :</p>
          <ul className="space-y-1.5 text-sm">
            {theory.tips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--dsfr-blue-france)' }}>&#8250;</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button data-testid="button-launch-simulation" onClick={() => useParcoursStore.setState({ currentStep: 16 })} className="w-full">
        Lancer la simulation
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
            <li>Scenario : <strong>{getScenarioLabel(scenarioChoisi)}</strong></li>
            <li>Collaborateur : <strong>{persona.prenomFictif}</strong>, {getTypeCollabShortLabel(typeCollab)}, profil <strong>{getDiscLabel(persona.disc)}</strong></li>
            <li>Relation : <strong>{getRelationLabel(persona.relation)}</strong> / Etat d'esprit : <strong>{getEtatEspritLabel(persona.etatEsprit)}</strong></li>
            <li className="flex items-center gap-1">
              Difficulte :
              {Array.from({ length: difficultyStars }, (_, i) => (
                <Star key={i} className="w-3 h-3 text-[var(--dsfr-warning)] fill-[var(--dsfr-warning)]" />
              ))}
            </li>
          </ul>
        </div>
        <p className="text-sm"><strong>Tu joues le role du manager. L'IA joue le role du collaborateur.</strong></p>
        <p className="text-sm">Ecris ta premiere intervention comme si tu commencais l'entretien. L'echange durera environ <strong>{tourMax * 2} minutes</strong>.</p>
        <p className="text-xs text-[var(--dsfr-grey-425)] italic">A tout moment, tape "/fin" pour terminer la simulation.</p>
      </div>
    </div>
  );
}
