import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type HistoryScenarioId = 'feedback_recadrage' | 'feedback_positif' | 'decision_difficile';

export interface HistoryEntry {
  id: string;
  scenarioId: HistoryScenarioId;
  scenarioLabel: string;
  timestamp: number;
  globalScore: number;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
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
      },
    }),
    {
      name: 'chatft-simulation-history',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export function formatHistoryDate(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  return `${date.replace('.', '.')} ${time}`;
}
