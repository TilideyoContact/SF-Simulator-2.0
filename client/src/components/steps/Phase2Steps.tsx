import { useParcoursStore, getRecommandation } from '@/lib/store';

import { getProfilLabel, getExperienceLabel, getScenarioLabel, getTypeCollabLabel } from '@/lib/helpers';
import { MessageSquare, Award, Zap, Sparkles } from 'lucide-react';

export function Step9Synthese() {
  const store = useParcoursStore();
  const { nextStep } = store;
  const recommandation = getRecommandation(store);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
          Synthèse de ton profil
        </h3>
      </div>

      <div className="bg-[var(--dsfr-blue-france-light)] p-4 space-y-2 text-sm border-l-[3px]" style={{ borderLeftColor: 'var(--dsfr-blue-france)' }}>
        <p className="font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Ton profil :</p>
        <ul className="space-y-1 list-none pl-0 text-xs">
          <li>Tu es <strong>{getProfilLabel(store.profil)}</strong>
            {store.experience && <> avec <strong>{getExperienceLabel(store.experience)}</strong> d'expérience</>}
          </li>
          {store.barometre && (
            <li>Qualité de vie : <strong>{store.barometre.qvt}</strong> / Engagement : <strong>{store.barometre.engagement}</strong></li>
          )}
          {store.objectifs.length > 0 && (
            <li>Objectifs : <strong>{store.objectifs.join(', ')}</strong></li>
          )}
          {store.difficulte && (
            <li>Étape la plus délicate : <strong>{store.difficulte}</strong></li>
          )}
        </ul>
        <p className="font-bold pt-1" style={{ color: 'var(--dsfr-blue-france)' }}>Ton entretien :</p>
        <ul className="space-y-1 list-none pl-0 text-xs">
          <li>Tu vas t'entraîner avec <strong>{getTypeCollabLabel(store.typeCollab)}</strong></li>
        </ul>
      </div>

      <p className="text-sm text-center text-[var(--dsfr-grey-425)]">Sur cette base, je te recommande de commencer par le scénario suivant :</p>

      <button
        data-testid="button-continue-scenario"
        onClick={() => {
          useParcoursStore.setState({ scenarioRecommande: recommandation });
          nextStep();
        }}
        className="w-full py-3 px-4 text-white font-bold text-sm transition-all rounded-lg hover:opacity-90"
        style={{ backgroundColor: 'var(--dsfr-blue-france)' }}
      >
        Voir les scénarios disponibles
      </button>
    </div>
  );
}

export function Step10Scenario() {
  const { scenarioRecommande, scenarioChoisi, setScenarioChoisi, nextStep } = useParcoursStore();

  const handleSelect = (id: string) => {
    setScenarioChoisi(id as any);
    setTimeout(() => nextStep(), 400);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" style={{ color: 'var(--dsfr-blue-france)' }} />
          <h3 className="text-xl font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
            Choisis ton scénario
          </h3>
        </div>
        <p className="text-sm text-[var(--dsfr-grey-425)]">Sélectionne le scénario qui correspond le mieux à ton besoin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-base font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>Exemples de scénario</h4>
          <button
            data-testid="card-option-feedback_recadrage"
            disabled={scenarioChoisi !== null && scenarioChoisi !== 'feedback_recadrage'}
            onClick={() => handleSelect('feedback_recadrage')}
            className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:border-[var(--dsfr-blue-france)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            {scenarioRecommande === 'feedback_recadrage' && (
              <span className="absolute -top-2 right-3 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider rounded" style={{ backgroundColor: 'var(--dsfr-blue-france)' }}>RECOMMANDÉ</span>
            )}
            <p className="font-medium text-sm text-foreground">Faire un feedback ou un recadrage sans dégrader la relation</p>
          </button>
          <button
            data-testid="card-option-feedback_positif"
            disabled={scenarioChoisi !== null && scenarioChoisi !== 'feedback_positif'}
            onClick={() => handleSelect('feedback_positif')}
            className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:border-[var(--dsfr-blue-france)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            {scenarioRecommande === 'feedback_positif' && (
              <span className="absolute -top-2 right-3 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider rounded" style={{ backgroundColor: 'var(--dsfr-blue-france)' }}>RECOMMANDÉ</span>
            )}
            <p className="font-medium text-sm text-foreground">Donner un feedback positif et structurant</p>
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-base font-bold" style={{ color: 'var(--dsfr-red-marianne)' }}>Décision difficile</h4>
          <button
            data-testid="card-option-decision_difficile"
            disabled={scenarioChoisi !== null && scenarioChoisi !== 'decision_difficile'}
            onClick={() => handleSelect('decision_difficile')}
            className="w-full text-left px-5 py-4 border border-[var(--dsfr-grey-850)] rounded-xl bg-white dark:bg-[var(--dsfr-grey-950)] hover:border-[var(--dsfr-red-marianne)] hover:shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            {scenarioRecommande === 'decision_difficile' && (
              <span className="absolute -top-2 right-3 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider rounded" style={{ backgroundColor: 'var(--dsfr-red-marianne)' }}>RECOMMANDÉ</span>
            )}
            <p className="font-medium text-sm text-foreground">Annoncer une décision difficile ou non négociable</p>
          </button>
        </div>
      </div>
    </div>
  );
}
