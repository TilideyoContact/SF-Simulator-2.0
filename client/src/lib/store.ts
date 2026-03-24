import { create } from 'zustand';

export type Mode = 'avance' | 'rapide' | null;
export type Profil = 'mp' | 'mi' | 'ms' | null;
export type QVT = 'bonne' | 'moyenne' | 'difficile' | null;
export type Engagement = 'bon' | 'moyen' | 'faible' | null;
export type Experience = 'debutant' | 'intermediaire' | 'experimente' | null;
export type Difficulte = 'preparation' | 'conduite' | 'feedback' | 'formalisation' | 'suivi' | null;
export type TypeCollab = 'agent' | 'manager' | 'pairs' | null;
export type Scenario = 'feedback_recadrage' | 'feedback_positif' | 'decision_difficile' | null;
export type DiscProfil = 'dominant' | 'influent' | 'stable' | 'consciencieux' | null;
export type Relation = number | null;
export type EtatEsprit = 'positif' | 'neutre' | 'stresse' | 'agace' | null;
export type DifficultyLevel = 'facile' | 'modere' | 'difficile' | 'expert';
export type ChoixPreSimulation = 'simulation' | 'theorie' | null;

export interface SimulationMessage {
  role: 'manager' | 'collaborateur';
  content: string;
  timestamp: string;
}

export interface AnalyseResult {
  clarte: number;
  ecoute: number;
  assertivite: number;
  global: number;
  pointsForts: string[];
  axesProgression: string[];
  conseilCle: string;
  impressionGenerale?: string;
  ressentiCollaborateur?: string;
  vigilances?: string;
  prochaineEtape?: string;
  axe1Label?: string;
  axe2Label?: string;
  axe3Label?: string;
}

export interface ParcoursState {
  currentStep: number;
  mode: Mode;
  profil: Profil;
  barometre: { qvt: QVT; engagement: Engagement } | null;
  experience: Experience;
  objectifs: string[];
  difficulte: string[];
  typeCollab: TypeCollab;
  complement: string;
  scenarioRecommande: string;
  scenarioChoisi: Scenario;
  persona: {
    disc: DiscProfil;
    relation: Relation;
    etatEsprit: EtatEsprit;
    niveauDifficulte: DifficultyLevel;
    prenomFictif: string;
  };
  choixPreSimulation: ChoixPreSimulation;
  simulation: {
    tourActuel: number;
    tourMax: number;
    messages: SimulationMessage[];
    isSimulating: boolean;
    isFinished: boolean;
  };
  analyse: AnalyseResult | null;
  feedbackParcours: {
    nps: number | null;
    facilite: number | null;
    pertinence: number | null;
    realisme: number | null;
    ameliorations: string[];
    commentaire: string;
  };
  sessionId: string | null;
  isLoading: boolean;

  setMode: (mode: Mode) => void;
  setProfil: (profil: Profil) => void;
  setBarometre: (b: { qvt: QVT; engagement: Engagement }) => void;
  setExperience: (exp: Experience) => void;
  setObjectifs: (obj: string[]) => void;
  setDifficulte: (d: string[]) => void;
  setTypeCollab: (t: TypeCollab) => void;
  setComplement: (c: string) => void;
  setScenarioChoisi: (s: Scenario) => void;
  setPersonaDisc: (d: DiscProfil) => void;
  setPersonaRelation: (r: Relation) => void;
  setPersonaEtatEsprit: (e: EtatEsprit) => void;
  setChoixPreSimulation: (c: ChoixPreSimulation) => void;
  addSimulationMessage: (msg: SimulationMessage) => void;
  setSimulationFinished: () => void;
  setAnalyse: (a: AnalyseResult) => void;
  setNps: (n: number) => void;
  setFacilite: (f: number) => void;
  setPertinence: (p: number) => void;
  setRealisme: (r: number) => void;
  setAmeliorations: (a: string[]) => void;
  setCommentaire: (c: string) => void;
  setSessionId: (id: string) => void;
  setIsLoading: (l: boolean) => void;
  pendingMessage: string | null;
  setPendingMessage: (msg: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  goToStep: (step: number) => void;
  resetParcours: () => void;
  resetToScenario: () => void;
  resetToPersona: () => void;
}

const PRENOMS = ['Thomas', 'Marie', 'Alexandre', 'Sophie', 'Lucas', 'Camille', 'Nicolas', 'Julie', 'Pierre', 'Claire'];

function getRandomPrenom(): string {
  return PRENOMS[Math.floor(Math.random() * PRENOMS.length)];
}

export function getRecommandation(state: ParcoursState): string {
  if (state.difficulte?.includes('feedback') || state.difficulte?.includes('conduite'))
    return 'feedback_recadrage';
  if (state.barometre?.qvt === 'difficile' || state.barometre?.engagement === 'faible')
    return 'decision_difficile';
  if (state.objectifs?.includes('confiant') || state.experience === 'debutant')
    return 'feedback_positif';
  return 'feedback_recadrage';
}

export function calculateDifficulty(disc: DiscProfil, relation: Relation, etatEsprit: EtatEsprit, typeCollab: TypeCollab): DifficultyLevel {
  let score = 0;
  const discScores: Record<string, number> = { stable: 0, influent: 1, consciencieux: 2, dominant: 3 };
  const relationScoreMap = (r: Relation): number => {
    if (r === null) return 0;
    if (r <= 1) return 3;
    if (r <= 2) return 2;
    if (r <= 3) return 1;
    return 0;
  };
  const etatScores: Record<string, number> = { positif: 0, neutre: 1, stresse: 2, agace: 3 };

  if (disc) score += discScores[disc] ?? 0;
  score += relationScoreMap(relation);
  if (etatEsprit) score += etatScores[etatEsprit] ?? 0;
  if (typeCollab === 'manager') score += 1;
  if (typeCollab === 'pairs') score += 0.5;

  if (score <= 2) return 'facile';
  if (score <= 5) return 'modere';
  if (score <= 8) return 'difficile';
  return 'expert';
}

function getStepsForMode(mode: Mode): number[] {
  if (mode === 'rapide') {
    // V2: show DISC/relation/etat d'esprit in rapid mode too (with pre-selected defaults)
    return [1, 2, 7, 5, 6, 11, 12, 13, 8, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  }
  return [1, 2, 7, 5, 6, 11, 12, 8, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
}

function getNextStepForMode(currentStep: number, mode: Mode): number {
  const steps = getStepsForMode(mode);
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex >= steps.length - 1) return currentStep;
  return steps[currentIndex + 1];
}

function getPrevStepForMode(currentStep: number, mode: Mode): number {
  const steps = getStepsForMode(mode);
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex <= 0) return currentStep;
  return steps[currentIndex - 1];
}

const initialState = {
  currentStep: 1,
  mode: null as Mode,
  profil: null as Profil,
  barometre: null as { qvt: QVT; engagement: Engagement } | null,
  experience: null as Experience,
  objectifs: [] as string[],
  difficulte: [] as string[],
  typeCollab: null as TypeCollab,
  complement: '',
  scenarioRecommande: 'feedback_recadrage',
  scenarioChoisi: null as Scenario,
  persona: {
    disc: null as DiscProfil,
    relation: null as Relation,
    etatEsprit: null as EtatEsprit,
    niveauDifficulte: 'modere' as DifficultyLevel,
    prenomFictif: getRandomPrenom(),
  },
  choixPreSimulation: null as ChoixPreSimulation,
  simulation: {
    tourActuel: 0,
    tourMax: 7,
    messages: [] as SimulationMessage[],
    isSimulating: false,
    isFinished: false,
  },
  analyse: null as AnalyseResult | null,
  feedbackParcours: {
    nps: null as number | null,
    facilite: null as number | null,
    pertinence: null as number | null,
    realisme: null as number | null,
    ameliorations: [] as string[],
    commentaire: '',
  },
  sessionId: null as string | null,
  isLoading: false,
  pendingMessage: null as string | null,
};

export const useParcoursStore = create<ParcoursState>((set, get) => ({
  ...initialState,

  setMode: (mode) => {
    set({ mode });
    if (mode === 'rapide') {
      set({
        persona: {
          ...get().persona,
          disc: 'stable',
          relation: 3,
          etatEsprit: 'neutre',
          niveauDifficulte: 'modere',
        }
      });
    }
  },
  setProfil: (profil) => set({ profil }),
  setBarometre: (barometre) => set({ barometre }),
  setExperience: (experience) => set({ experience }),
  setObjectifs: (objectifs) => set({ objectifs }),
  setDifficulte: (difficulte) => set({ difficulte }),
  setTypeCollab: (typeCollab) => set({ typeCollab }),
  setComplement: (complement) => set({ complement }),
  setScenarioChoisi: (scenarioChoisi) => set({ scenarioChoisi }),
  setPersonaDisc: (disc) => {
    const state = get();
    const niveauDifficulte = calculateDifficulty(disc, state.persona.relation, state.persona.etatEsprit, state.typeCollab);
    set({ persona: { ...state.persona, disc, niveauDifficulte } });
  },
  setPersonaRelation: (relation) => {
    const state = get();
    const niveauDifficulte = calculateDifficulty(state.persona.disc, relation, state.persona.etatEsprit, state.typeCollab);
    set({ persona: { ...state.persona, relation, niveauDifficulte } });
  },
  setPersonaEtatEsprit: (etatEsprit) => {
    const state = get();
    const niveauDifficulte = calculateDifficulty(state.persona.disc, state.persona.relation, etatEsprit, state.typeCollab);
    set({ persona: { ...state.persona, etatEsprit, niveauDifficulte } });
  },
  setChoixPreSimulation: (choixPreSimulation) => set({ choixPreSimulation }),
  addSimulationMessage: (msg) => {
    const state = get();
    const messages = [...state.simulation.messages, msg];
    const tourActuel = messages.filter(m => m.role === 'manager').length;
    set({ simulation: { ...state.simulation, messages, tourActuel } });
  },
  setSimulationFinished: () => {
    const state = get();
    set({ simulation: { ...state.simulation, isFinished: true, isSimulating: false } });
  },
  setAnalyse: (analyse) => set({ analyse }),
  setNps: (nps) => set({ feedbackParcours: { ...get().feedbackParcours, nps } }),
  setFacilite: (facilite) => set({ feedbackParcours: { ...get().feedbackParcours, facilite } }),
  setPertinence: (pertinence) => set({ feedbackParcours: { ...get().feedbackParcours, pertinence } }),
  setRealisme: (realisme) => set({ feedbackParcours: { ...get().feedbackParcours, realisme } }),
  setAmeliorations: (ameliorations) => set({ feedbackParcours: { ...get().feedbackParcours, ameliorations } }),
  setCommentaire: (commentaire) => set({ feedbackParcours: { ...get().feedbackParcours, commentaire } }),
  setSessionId: (sessionId) => set({ sessionId }),
  setIsLoading: (isLoading) => set({ isLoading }),
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),

  nextStep: () => {
    const state = get();
    const nextStep = getNextStepForMode(state.currentStep, state.mode);
    set({ currentStep: nextStep });
  },
  prevStep: () => {
    const state = get();
    const prev = getPrevStepForMode(state.currentStep, state.mode);
    set({ currentStep: prev });
  },
  skipStep: () => {
    const state = get();
    const next = getNextStepForMode(state.currentStep, state.mode);
    set({ currentStep: next });
  },
  goToStep: (step) => set({ currentStep: step }),

  resetParcours: () => set({
    ...initialState,
    persona: { ...initialState.persona, prenomFictif: getRandomPrenom() },
  }),
  resetToScenario: () => set({
    currentStep: 10,
    scenarioChoisi: null,
    persona: { disc: null, relation: null, etatEsprit: null, niveauDifficulte: 'modere', prenomFictif: getRandomPrenom() },
    choixPreSimulation: null,
    simulation: { tourActuel: 0, tourMax: 7, messages: [], isSimulating: false, isFinished: false },
    analyse: null,
    feedbackParcours: { nps: null, facilite: null, pertinence: null, realisme: null, ameliorations: [], commentaire: '' },
  }),
  resetToPersona: () => {
    const { mode } = get();
    const isRapide = mode === 'rapide';
    set({
      currentStep: isRapide ? 14 : 11,
      persona: {
        disc: isRapide ? 'stable' : null,
        relation: isRapide ? 3 : null,
        etatEsprit: isRapide ? 'neutre' : null,
        niveauDifficulte: 'modere',
        prenomFictif: getRandomPrenom(),
      },
      choixPreSimulation: null,
      simulation: { tourActuel: 0, tourMax: 7, messages: [], isSimulating: false, isFinished: false },
      analyse: null,
      feedbackParcours: { nps: null, facilite: null, pertinence: null, realisme: null, ameliorations: [], commentaire: '' },
    });
  },
}));
