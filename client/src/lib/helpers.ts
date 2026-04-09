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
    mp: 'Manager de proximité',
    mi: 'Manager intermédiaire',
    ms: 'Manager supérieur',
  };
  return profil ? labels[profil] ?? '' : '';
}

export function getExperienceLabel(exp: Experience): string {
  const labels: Record<string, string> = {
    debutant: "Moins d'1 an",
    intermediaire: '1 à 3 ans',
    experimente: 'Plus de 3 ans',
  };
  return exp ? labels[exp] ?? '' : '';
}

export function getScenarioLabel(scenario: Scenario): string {
  const labels: Record<string, string> = {
    feedback_recadrage: 'Faire un feedback ou un recadrage',
    feedback_positif: 'Donner un feedback positif et structurant',
    decision_difficile: 'Annoncer une décision difficile',
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
    neutre: 'Neutre / Concentré',
    stresse: 'Stressé / Préoccupé',
    agace: 'Agacé / Sur la défensive',
  };
  return etat ? labels[etat] ?? '' : '';
}

export function getDifficultyLabel(d: DifficultyLevel): string {
  const labels: Record<string, string> = {
    facile: 'Facile',
    modere: 'Modéré',
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
      default: 'un collaborateur coopératif et à l\'écoute, qui cherchera des solutions avec toi',
      tendue: 'un collaborateur réservé mais loyal, qui aura besoin de temps pour s\'ouvrir',
    },
    dominant: {
      default: 'un collaborateur direct et impatient, qui challengera tes arguments et demandera des actions concrètes rapidement',
      bonne: 'un collaborateur énergique et orienté résultats, ouvert mais exigeant',
    },
    consciencieux: {
      default: 'un collaborateur méthodique mais sous pression, qui demandera des preuves factuelles avant d\'adhérer',
      bonne: 'un collaborateur rigoureux et analytique, qui appréciera une approche structurée',
    },
    influent: {
      default: 'un collaborateur expressif mais méfiant, qui pourra digresser ou réagir émotionnellement',
      bonne: 'un collaborateur enthousiaste et communicatif, qui appréciera les échanges ouverts',
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
      title: 'Préparer un feedback / recadrage',
      introduction: 'Le feedback de recadrage vise à corriger un comportement ou une pratique tout en préservant la qualité de la relation. Il repose sur des faits observables, une posture de respect mutuel (OK+/OK+) et une co-construction de la solution.',
      method: {
        name: 'DESC',
        steps: [
          { letter: 'D', title: 'Décrire les faits', description: 'Cite des faits précis, dates, observables. Pas de jugement, pas d\'interprétation. Ex: "Le 15 mars, lors de la réunion d\'équipe, j\'ai constaté que le rapport n\'avait pas été remis."' },
          { letter: 'E', title: 'Exprimer le ressenti', description: 'Utilise le JE pour exprimer l\'impact. Ex: "Ce que ça génère pour moi, c\'est de l\'inquiétude sur le suivi des dossiers."' },
          { letter: 'S', title: 'Spécifier les changements', description: 'Propose ou co-construis un plan d\'action concret. Ex: "Comment pourrait-on s\'organiser pour que ça ne se reproduise pas ?"' },
          { letter: 'C', title: 'Conséquences positives', description: 'Montre les bénéfices du changement pour tous. Ex: "Ça permettrait à toute l\'équipe de travailler plus sereinement."' },
        ],
      },
      posture: [
        'Posture OK+/OK+ : respect mutuel, ni soumission ni domination',
        'Écoute active : reformuler avant de répondre',
        'Utiliser le JE, jamais le TU accusateur',
        'Rester factuel : pas de "toujours", "jamais"',
        'Laisser des silences pour que le collaborateur s\'exprime',
        'Vérifier l\'adhésion : "Comment tu vois les choses ?"',
      ],
      erreurs: [
        'Commencer par un jugement ("Tu es toujours en retard")',
        'Enchaîner les reproches sans écouter',
        'Ne pas proposer de solution concrète',
        'Minimiser le ressenti du collaborateur',
        'Faire un monologue sans laisser de place à l\'échange',
      ],
      exemple: {
        situation: 'Un agent ne respecte pas les délais de traitement des dossiers depuis 3 semaines.',
        bonneApproche: 'Thomas, j\'ai constaté que les 3 dernières semaines, 4 dossiers ont dépassé le délai de traitement. Ce que ça génère, c\'est une surcharge pour tes collègues. Comment tu expliques ça ? Qu\'est-ce qu\'on peut mettre en place ensemble ?',
        mauvaiseApproche: 'Tu es toujours en retard sur tes dossiers, ça ne peut plus durer, il faut que tu fasses un effort.',
      },
    },
    feedback_positif: {
      title: 'Préparer un feedback positif',
      introduction: 'Le feedback positif vise à reconnaître et valoriser une action concrète. Il doit être spécifique, sincère et relié à l\'impact collectif. Ce n\'est pas un simple "c\'est bien" — c\'est un acte managérial structuré.',
      method: {
        name: 'MERCI',
        steps: [
          { letter: 'M', title: 'Mentionner l\'action', description: 'Cite un fait précis, daté, observable. Ex: "Lors de l\'accueil du public mardi, j\'ai remarqué que tu as pris le temps d\'expliquer la procédure."' },
          { letter: 'E', title: 'Expliquer l\'impact', description: 'Relie à l\'impact concret sur l\'équipe ou les usagers. Ex: "L\'usager est reparti avec une solution claire, et ça a évité un rappel."' },
          { letter: 'R', title: 'Relier aux valeurs', description: 'Connecte à une compétence ou valeur collective. Ex: "C\'est exactement la qualité de service qu\'on vise."' },
          { letter: 'C', title: 'Conclure en projetant', description: 'Ouvre des perspectives. Ex: "J\'aimerais qu\'on capitalise sur cette approche pour les nouveaux arrivants."' },
          { letter: 'I', title: 'Impliquer', description: 'Co-construis la suite. Ex: "Comment tu vois la suite ? Qu\'est-ce qui t\'aiderait à aller plus loin ?"' },
        ],
      },
      posture: [
        'Être spécifique : pas de "c\'est bien" vague',
        'Être sincère : le collaborateur détecte le feedback instrumentalisé',
        'Ne jamais conditionner : pas de "c\'est bien MAIS..."',
        'Relier à l\'impact collectif, pas juste individuel',
        'Projeter vers l\'avenir, pas juste constater le passé',
        'Demander le ressenti du collaborateur',
      ],
      erreurs: [
        'Rester vague ("Bon travail, continue")',
        'Conditionner le positif ("C\'est bien, mais...")',
        'Instrumentaliser ("C\'est super, d\'ailleurs j\'aurais besoin que...")',
        'Être condescendant entre pairs',
        'Ne pas relier à l\'impact collectif',
      ],
      exemple: {
        situation: 'Une agente a pris l\'initiative de réorganiser le planning d\'accueil pour fluidifier les pics.',
        bonneApproche: 'Sophie, j\'ai vu que tu as réorganisé le planning d\'accueil la semaine dernière. L\'attente moyenne est passée de 25 à 12 minutes. C\'est exactement ce type d\'initiative qui fait la différence pour les usagers. Comment tu vois la suite ?',
        mauvaiseApproche: 'C\'est bien ce que tu as fait avec le planning. D\'ailleurs, j\'aurais besoin que tu gères aussi les réclamations.',
      },
    },
    decision_difficile: {
      title: 'Préparer l\'annonce d\'une décision difficile',
      introduction: 'Annoncer une décision difficile demande de la clarté, de l\'empathie et de la fermeté. La décision n\'est pas négociable, mais la façon de l\'annoncer et de l\'accompagner fait toute la différence.',
      method: {
        name: 'Annonce structurée',
        steps: [
          { letter: '1', title: 'Cadrer', description: 'Poser le contexte sérieux dès le début. Ex: "J\'ai demandé cet entretien parce que j\'ai une décision importante à te communiquer."' },
          { letter: '2', title: 'Annoncer', description: 'Nommer la décision clairement, sans tourner autour. Ex: "La décision qui a été prise est [décision]. Voici les raisons..."' },
          { letter: '3', title: 'Accueillir', description: 'Laisser le temps de la réaction. Écouter sans minimiser. Ex: "Je comprends que ça puisse être difficile. Comment tu réagis ?"' },
          { letter: '4', title: 'Tenir', description: 'Rester ferme sur la décision tout en restant empathique. Distinguer le non-négociable du discutable.' },
          { letter: '5', title: 'Accompagner', description: 'Proposer un accompagnement concret. Ex: "Voilà ce que je te propose pour la suite. On se revoit le [date]."' },
        ],
      },
      posture: [
        'Être direct : ne pas tourner autour du pot',
        'Être empathique : accueillir l\'émotion sans la nier',
        'Distinguer non-négociable (la décision) et discutable (les modalités)',
        'Ne pas s\'excuser excessivement (ça décrédibilise)',
        'Proposer un accompagnement concret',
        'Fixer un rendez-vous de suivi',
      ],
      erreurs: [
        'Tourner autour du pot pendant 10 minutes',
        'S\'excuser tellement que la décision perd sa légitimité',
        'Minimiser l\'impact ("C\'est pas si grave")',
        'Négocier le non-négociable',
        'Ne pas proposer d\'accompagnement',
      ],
      exemple: {
        situation: 'Un agent doit être muté dans une autre agence suite à une réorganisation.',
        bonneApproche: 'Thomas, j\'ai une décision importante à t\'annoncer. Suite à la réorganisation du réseau, ton poste est transféré à l\'agence de [lieu]. Je comprends que c\'est difficile. Voici ce qui est prévu pour t\'accompagner...',
        mauvaiseApproche: 'Écoute, il y a des changements... enfin, c\'est compliqué... disons que... bon, tu vas devoir changer d\'agence, mais c\'est pas si grave.',
      },
    },
  };
  return scenario ? content[scenario] ?? content.feedback_recadrage : content.feedback_recadrage;
}
