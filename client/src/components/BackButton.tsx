import { ArrowLeft } from 'lucide-react';
import { useParcoursStore, canGoBackFromStep } from '@/lib/store';

export function BackButton() {
  const { prevStep, currentStep } = useParcoursStore();

  if (!canGoBackFromStep(currentStep)) return null;

  return (
    <button
      data-testid="button-back-step"
      onClick={() => prevStep()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dsfr-blue-france)] hover:text-[var(--dsfr-blue-france)] hover:underline transition-colors mb-4 py-1"
    >
      <ArrowLeft className="w-4 h-4" />
      Retour à l'étape précédente
    </button>
  );
}
