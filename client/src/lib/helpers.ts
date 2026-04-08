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
      default: 'un collaborateur cooperatif et a l\'ecoute, qui cherchera des solutions avec toi',
      tendue: 'un collaborateur reserve mais loyal, qui aura besoin de temps pour s\'ouvrir',
    },
    dominant: {
      default: 'un collaborateur direct et impatient, qui challengera tes arguments et demandera des actions concretes rapidement',
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

export interface TheoryContent {
  title: string;
  introduction: string;
  method: { name: string; steps: Array<{ letter: string; title: string; description: string }> };
  posture: string[];
  erreurs: string[];
  exemple: { situation: string; bonneApproche: string; mauvaiseApproche: string };
}

export function getTheoryContent(scenario: Scenario): TheoryContent {
  const content: Record<string, TheoryContent> = {
    feedback_recadrage: {
      title: 'Preparer un feedback / recadrage',
      introduction: 'Le feedback de recadrage vise a corriger un comportement ou une pratique tout en preservant la qualite de la relation. Il repose sur des faits observables, une posture de respect mutuel (OK+/OK+) et une co-construction de la solution.',
      method: {
        name: 'DESC',
        steps: [
          { letter: 'D', title: 'Decrire les faits', description: 'Cite des faits precis, dates, observables. Pas de jugement, pas d\'interpretation. Ex: "Le 15 mars, lors de la reunion d\'equipe, j\'ai constate que le rapport n\'avait pas ete remis."' },
          { letter: 'E', title: 'Exprimer le ressenti', description: 'Utilise le JE pour exprimer l\'impact. Ex: "Ce que ca genere pour moi, c\'est de l\'inquietude sur le suivi des dossiers."' },
          { letter: 'S', title: 'Specifier les changements', description: 'Propose ou co-construis un plan d\'action concret. Ex: "Comment pourrait-on s\'organiser pour que ca ne se reproduise pas ?"' },
          { letter: 'C', title: 'Consequences positives', description: 'Montre les benefices du changement pour tous. Ex: "Ca permettrait a toute l\'equipe de travailler plus sereinement."' },
        ],
      },
      posture: [
        'Posture OK+/OK+ : respect mutuel, ni soumission ni domination',
        'Ecoute active : reformuler avant de repondre',
        'Utiliser le JE, jamais le TU accusateur',
        'Rester factuel : pas de "toujours", "jamais"',
        'Laisser des silences pour que le collaborateur s\'exprime',
        'Verifier l\'adhesion : "Comment tu vois les choses ?"',
      ],
      erreurs: [
        'Commencer par un jugement ("Tu es toujours en retard")',
        'Enchainer les reproches sans ecouter',
        'Ne pas proposer de solution concrete',
        'Minimiser le ressenti du collaborateur',
        'Faire un monologue sans laisser de place a l\'echange',
      ],
      exemple: {
        situation: 'Un agent ne respecte pas les delais de traitement des dossiers depuis 3 semaines.',
        bonneApproche: 'Thomas, j\'ai constate que les 3 dernieres semaines, 4 dossiers ont depasse le delai de traitement. Ce que ca genere, c\'est une surcharge pour tes collegues. Comment tu expliques ca ? Qu\'est-ce qu\'on peut mettre en place ensemble ?',
        mauvaiseApproche: 'Tu es toujours en retard sur tes dossiers, ca ne peut plus durer, il faut que tu fasses un effort.',
      },
    },
    feedback_positif: {
      title: 'Preparer un feedback positif',
      introduction: 'Le feedback positif vise a reconnaitre et valoriser une action concrete. Il doit etre specifique, sincere et relie a l\'impact collectif. Ce n\'est pas un simple "c\'est bien" — c\'est un acte managerial structure.',
      method: {
        name: 'MERCI',
        steps: [
          { letter: 'M', title: 'Mentionner l\'action', description: 'Cite un fait precis, date, observable. Ex: "Lors de l\'accueil du public mardi, j\'ai remarque que tu as pris le temps d\'expliquer la procedure."' },
          { letter: 'E', title: 'Expliquer l\'impact', description: 'Relie a l\'impact concret sur l\'equipe ou les usagers. Ex: "L\'usager est reparti avec une solution claire, et ca a evite un rappel."' },
          { letter: 'R', title: 'Relier aux valeurs', description: 'Connecte a une competence ou valeur collective. Ex: "C\'est exactement la qualite de service qu\'on vise."' },
          { letter: 'C', title: 'Conclure en projetant', description: 'Ouvre des perspectives. Ex: "J\'aimerais qu\'on capitalise sur cette approche pour les nouveaux arrivants."' },
          { letter: 'I', title: 'Impliquer', description: 'Co-construis la suite. Ex: "Comment tu vois la suite ? Qu\'est-ce qui t\'aiderait a aller plus loin ?"' },
        ],
      },
      posture: [
        'Etre specifique : pas de "c\'est bien" vague',
        'Etre sincere : le collaborateur detecte le feedback instrumentalise',
        'Ne jamais conditionner : pas de "c\'est bien MAIS..."',
        'Relier a l\'impact collectif, pas juste individuel',
        'Projeter vers l\'avenir, pas juste constater le passe',
        'Demander le ressenti du collaborateur',
      ],
      erreurs: [
        'Rester vague ("Bon travail, continue")',
        'Conditionner le positif ("C\'est bien, mais...")',
        'Instrumentaliser ("C\'est super, d\'ailleurs j\'aurais besoin que...")',
        'Etre condescendant entre pairs',
        'Ne pas relier a l\'impact collectif',
      ],
      exemple: {
        situation: 'Une agente a pris l\'initiative de reorganiser le planning d\'accueil pour fluidifier les pics.',
        bonneApproche: 'Sophie, j\'ai vu que tu as reorganise le planning d\'accueil la semaine derniere. L\'attente moyenne est passee de 25 a 12 minutes. C\'est exactement ce type d\'initiative qui fait la difference pour les usagers. Comment tu vois la suite ?',
        mauvaiseApproche: 'C\'est bien ce que tu as fait avec le planning. D\'ailleurs, j\'aurais besoin que tu geres aussi les reclamations.',
      },
    },
    decision_difficile: {
      title: 'Preparer l\'annonce d\'une decision difficile',
      introduction: 'Annoncer une decision difficile demande de la clarte, de l\'empathie et de la fermete. La decision n\'est pas negociable, mais la facon de l\'annoncer et de l\'accompagner fait toute la difference.',
      method: {
        name: 'Annonce structuree',
        steps: [
          { letter: '1', title: 'Cadrer', description: 'Poser le contexte serieux des le debut. Ex: "J\'ai demande cet entretien parce que j\'ai une decision importante a te communiquer."' },
          { letter: '2', title: 'Annoncer', description: 'Nommer la decision clairement, sans tourner autour. Ex: "La decision qui a ete prise est [decision]. Voici les raisons..."' },
          { letter: '3', title: 'Accueillir', description: 'Laisser le temps de la reaction. Ecouter sans minimiser. Ex: "Je comprends que ca puisse etre difficile. Comment tu reagis ?"' },
          { letter: '4', title: 'Tenir', description: 'Rester ferme sur la decision tout en restant empathique. Distinguer le non-negociable du discutable.' },
          { letter: '5', title: 'Accompagner', description: 'Proposer un accompagnement concret. Ex: "Voila ce que je te propose pour la suite. On se revoit le [date]."' },
        ],
      },
      posture: [
        'Etre direct : ne pas tourner autour du pot',
        'Etre empathique : accueillir l\'emotion sans la nier',
        'Distinguer non-negociable (la decision) et discutable (les modalites)',
        'Ne pas s\'excuser excessivement (ca decredibilise)',
        'Proposer un accompagnement concret',
        'Fixer un rendez-vous de suivi',
      ],
      erreurs: [
        'Tourner autour du pot pendant 10 minutes',
        'S\'excuser tellement que la decision perd sa legitimite',
        'Minimiser l\'impact ("C\'est pas si grave")',
        'Negocier le non-negociable',
        'Ne pas proposer d\'accompagnement',
      ],
      exemple: {
        situation: 'Un agent doit etre mute dans une autre agence suite a une reorganisation.',
        bonneApproche: 'Thomas, j\'ai une decision importante a t\'annoncer. Suite a la reorganisation du reseau, ton poste est transfere a l\'agence de [lieu]. Je comprends que c\'est difficile. Voici ce qui est prevu pour t\'accompagner...',
        mauvaiseApproche: 'Ecoute, il y a des changements... enfin, c\'est complique... disons que... bon, tu vas devoir changer d\'agence, mais c\'est pas si grave.',
      },
    },
  };
  return scenario ? content[scenario] ?? content.feedback_recadrage : content.feedback_recadrage;
}
