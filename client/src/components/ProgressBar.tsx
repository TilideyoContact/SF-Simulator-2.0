import { cn } from '@/lib/utils';
import { useParcoursStore } from '@/lib/store';

const PHASES = [
  { label: 'Profilage', steps: [1, 2, 7, 5, 6, 8] },
  { label: 'Persona', steps: [11, 12, 13, 14] },
  { label: 'Préparation', steps: [15] },
  { label: 'Simulation', steps: [16, 17, 18] },
  { label: 'Analyse', steps: [19, 20, 21] },
  { label: 'Feedback', steps: [22, 23, 24, 26, 25] },
];

export function ProgressBar() {
  const currentStep = useParcoursStore((s) => s.currentStep);

  const currentPhaseIndex = PHASES.findIndex((p) => p.steps.includes(currentStep));

  return (
    <div data-testid="progress-bar" className="w-full space-y-1.5">
      <div className="flex items-center gap-1">
        {PHASES.map((phase, i) => {
          const isActive = i === currentPhaseIndex;
          const isDone = i < currentPhaseIndex;
          return (
            <div key={phase.label} className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={cn(
                  'h-1 w-full transition-all duration-500',
                  i === 0 && 'rounded-l-full',
                  i === PHASES.length - 1 && 'rounded-r-full',
                  isDone
                    ? 'bg-[var(--dsfr-blue-france)]'
                    : isActive
                    ? 'bg-[var(--dsfr-blue-france)] opacity-60'
                    : 'bg-[var(--dsfr-grey-925)]',
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 truncate w-full text-center transition-colors font-medium',
                  isActive
                    ? 'text-[var(--dsfr-blue-france)] font-bold'
                    : isDone
                    ? 'text-[var(--dsfr-blue-france)] opacity-70'
                    : 'text-[var(--dsfr-grey-425)]',
                )}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
