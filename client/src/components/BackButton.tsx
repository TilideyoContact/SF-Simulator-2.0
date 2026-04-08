import { ArrowLeft } from 'lucide-react';
import { useParcoursStore } from '@/lib/store';

export function BackButton() {
  const { prevStep, currentStep } = useParcoursStore();

  if (currentStep <= 1) return null;
  if (currentStep >= 16) return null;

  return (
    <button
      onClick={() => prevStep()}
      className="flex items-center gap-1.5 text-sm text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-blue-france)] transition-colors mb-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Retour
    </button>
  );
}
