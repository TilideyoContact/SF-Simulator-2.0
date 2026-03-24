import type { Profil, Experience, Scenario, DiscProfil, Relation, EtatEsprit, DifficultyLevel, TypeCollab } from './store';

export function getTypeCollabLabel(t: TypeCollab): string {
  const labels: Record<string, string> = {
    agent: 'un agent',
    manager: 'un manager',
    pairs: 'un pair',
  };
  return t ? labels[t] ?? '' : '';
}

export function getTypeCollabShortLabel(t: TypeCollab): string {
  const labels: Record<string, string> = {
    agent: 'agent',
    manager: 'manager',
    pairs: 'pair',
  };
  return t ? labels[t] ?? '' : '';
}

export function getProfilLabel(profil: Profil): string {
  const labels: Record<string, string> = {
    mp: 'Manager de proximite',
    mi: 'Manager intermediaire',
    ms: 'Manager superieur',
  };
  return profil ? labels[profil] ?? '' : '';
}

export function getExperienceLabel(exp: Experience): string {
  const labels: Record<string, string> = {
    debutant: "Moins d'1 an",
    intermediaire: '1 a 3 ans',
    experimente: 'Plus de 3 ans',
  };
  return exp ? labels[exp] ?? '' : '';
}

export function getScenarioLabel(scenario: Scenario): string {
  const labels: Record<string, string> = {
    feedback_recadrage: 'Faire un feedback ou un recadrage',
    feedback_positif: 'Donner un feedback positif et structurant',
    decision_difficile: 'Annoncer une decision difficile',
  };
  return scenario ? labels[scenario] ?? '' : '';
}

export function getDiscLabel(disc: DiscProfil): string {
  const labels: Record<string, string> = {
    dominant: 'Dominant',
    influent: 'Influent',
    stable: 'Stable',
    consciencieux: 'Consciencieux',
  };
  return disc ? labels[disc] ?? '' : '';
}

export function getRelationLabel(rel: Relation): string {
  if (rel === null || rel === undefined) return '';
  const labels: Record<number, string> = {
    1: 'Tendue',
    2: 'Difficile',
    3: 'Neutre',
    4: 'Bonne',
    5: 'Excellente',
  };
  return labels[rel] ?? '';
}

export function getEtatEspritLabel(etat: EtatEsprit): string {
  const labels: Record<string, string> = {
    positif: 'Positif / Ouvert',
    neutre: 'Neutre / Concentre',
    stresse: 'Stresse / Preoccupe',
    agace: 'Agace / Sur la defensive',
  };
  return etat ? labels[etat] ?? '' : '';
}

export function getDifficultyLabel(d: DifficultyLevel): string {
  const labels: Record<string, string> = {
    facile: 'Facile',
    modere: 'Modere',
    difficile: 'Difficile',
    expert: 'Expert',
  };
  return labels[d] ?? '';
}

export function getDifficultyStars(d: DifficultyLevel): number {
  const stars: Record<string, number> = { facile: 1, modere: 2, difficile: 3, expert: 4 };
  return stars[d] ?? 1;
}

export function getPersonaDescription(disc: DiscProfil, relation: Relation, etatEsprit: EtatEsprit): string {
  const descriptions: Record<string, Record<string, string>> = {
    stable: {
      default: 'un collaborateur cooperatif et a l\'ecoute, qui cherchera des solutions avec vous',
      tendue: 'un collaborateur reserve mais loyal, qui aura besoin de temps pour s\'ouvrir',
    },
    dominant: {
      default: 'un collaborateur direct et impatient, qui challengera vos arguments et demandera des actions concretes rapidement',
      bonne: 'un collaborateur energique et oriente resultats, ouvert mais exigeant',
    },
    consciencieux: {
      default: 'un collaborateur methodique mais sous pression, qui demandera des preuves factuelles avant d\'adherer',
      bonne: 'un collaborateur rigoureux et analytique, qui appreciera une approche structuree',
    },
    influent: {
      default: 'un collaborateur expressif mais mefiant, qui pourra digresser ou reagir emotionnellement',
      bonne: 'un collaborateur enthousiaste et communicatif, qui appreciera les echanges ouverts',
    },
  };

  if (!disc) return '';
  const discDesc = descriptions[disc];
  if (!discDesc) return '';
  if (relation !== null && relation !== undefined) {
    if (relation <= 2 && discDesc['tendue']) return discDesc['tendue'];
    if (relation >= 4 && discDesc['bonne']) return discDesc['bonne'];
  }
  return discDesc.default ?? '';
}

export function getTourMax(scenario: Scenario, typeCollab: TypeCollab): number {
  const matrix: Record<string, Record<string, number>> = {
    feedback_recadrage: { agent: 7, manager: 9, pairs: 8 },
    feedback_positif: { agent: 6, manager: 7, pairs: 7 },
    decision_difficile: { agent: 8, manager: 10, pairs: 9 },
  };
  if (!scenario || !typeCollab) return 7;
  return matrix[scenario]?.[typeCollab] ?? 7;
}

export function getScoreLabel(score: number): string {
  if (score <= 1) return 'Confus';
  if (score <= 2) return 'Insuffisant';
  if (score <= 3) return 'En progression';
  if (score <= 4) return 'Efficace';
  return 'Exemplaire';
}

export function getDiscColor(disc: DiscProfil): string {
  const colors: Record<string, string> = {
    dominant: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    influent: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    stable: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    consciencieux: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  };
  return disc ? colors[disc] ?? '' : '';
}

export function getTheoryContent(scenario: Scenario): { title: string; methods: string[]; tips: string[] } {
  const content: Record<string, { title: string; methods: string[]; tips: string[] }> = {
    feedback_recadrage: {
      title: 'Methodes cles pour le feedback et recadrage',
      methods: [
        'Methode DESC : Decrire les faits, Exprimer le ressenti, Specifier les attentes, Conclure positivement',
        'Methode DEPAR : Demander, Ecouter, Proposer, Agir ensemble, Recapituler',
        'Technique du JE : Formuler en "je constate" plutot que "vous faites"',
      ],
      tips: [
        'Commencez par reconnaitre ce qui fonctionne bien',
        'Soyez factuel et specifique dans vos observations',
        'Proposez un plan d\'action co-construit',
      ],
    },
    feedback_positif: {
      title: 'Methodes cles pour le feedback positif',
      methods: [
        'Soyez specifique : citez des faits precis plutot que des generalites',
        'Reliez la performance aux objectifs de l\'equipe',
        'Encouragez le developpement : montrez les perspectives d\'evolution',
      ],
      tips: [
        'Faites le feedback au plus pres de l\'action',
        'Evitez le "mais" apres un compliment',
        'Demandez au collaborateur comment il percoit sa performance',
      ],
    },
    decision_difficile: {
      title: 'Methodes cles pour annoncer une decision difficile',
      methods: [
        'Annoncez la decision clairement des le debut',
        'Expliquez le contexte et les raisons factuelles',
        'Laissez un espace d\'expression pour les reactions',
      ],
      tips: [
        'Ne tournez pas autour du pot, soyez direct mais empathique',
        'Preparez-vous aux differentes reactions possibles',
        'Proposez un accompagnement pour la suite',
      ],
    },
  };
  return scenario ? content[scenario] ?? content.feedback_recadrage : content.feedback_recadrage;
}
