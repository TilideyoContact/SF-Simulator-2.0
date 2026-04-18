import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type HistoryScenarioId = 'feedback_recadrage' | 'feedback_positif' | 'decision_difficile';

export interface HistoryMessage {
  role: 'manager' | 'collaborateur';
  content: string;
  timestamp?: string;
}

export interface HistoryPersonaSnapshot {
  disc: string | null;
  prenomFictif: string;
  relation: number | null;
  etatEsprit: string | null;
}

export interface HistoryEntry {
  id: string;
  scenarioId: HistoryScenarioId;
  scenarioLabel: string;
  timestamp: number;
  globalScore: number;
  messages: HistoryMessage[];
  persona: HistoryPersonaSnapshot;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => string;
  getEntry: (id: string) => HistoryEntry | undefined;
}

const MAX_ENTRIES = 10;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        const id = `${entry.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
        const next = [{ ...entry, id }, ...get().entries].slice(0, MAX_ENTRIES);
        set({ entries: next });
        return id;
      },
      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    {
      name: 'chatft-simulation-history',
      storage: createJSONStorage(() => localStorage),
      version: 2,
    }
  )
);

export function formatHistoryDate(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  return `${date.replace('.', '.')} ${time}`;
}
