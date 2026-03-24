import { useEffect, useRef } from 'react';
import { useParcoursStore } from '@/lib/store';
import type { Scenario } from '@/lib/store';
import ChatPage from './ChatPage';

const SLUG_TO_SCENARIO: Record<string, Scenario> = {
  'feedback-recadrage': 'feedback_recadrage',
  'feedback-positif': 'feedback_positif',
  'decision-difficile': 'decision_difficile',
};

interface ScenarioPageProps {
  slug: string;
}

export default function ScenarioPage({ slug }: ScenarioPageProps) {
  const scenario = SLUG_TO_SCENARIO[slug] ?? 'feedback_recadrage';
  const resetParcours = useParcoursStore((s) => s.resetParcours);
  const setScenarioChoisi = useParcoursStore((s) => s.setScenarioChoisi);
  const initialized = useRef(false);
  const prevSlug = useRef<string | null>(null);

  useEffect(() => {
    if (prevSlug.current !== slug) {
      prevSlug.current = slug;
      resetParcours();
      setScenarioChoisi(scenario);
      initialized.current = true;
    }
  }, [slug, scenario, resetParcours, setScenarioChoisi]);

  return <ChatPage activeSlug={slug} />;
}
