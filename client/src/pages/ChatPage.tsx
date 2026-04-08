import { useRef, useEffect, useCallback } from 'react';
import { useParcoursStore } from '@/lib/store';
import { ProgressBar } from '@/components/ProgressBar';
import { ChatInput } from '@/components/ChatInput';
import { SideMenu } from '@/components/SideMenu';
import franceTravailLogo from '@assets/image_1771580674143.png';
import { Step1Welcome, Step2Profil, Step5Objectifs, Step6Difficultes, Step7TypeCollab, Step8Complement } from '@/components/steps/Phase1Steps';
import { Step11Disc, Step12Relation, Step13EtatEsprit, Step14RecapPersona } from '@/components/steps/Phase3Steps';
import { Step15PreSimulation, Step15bTheory, Step15c } from '@/components/steps/Phase4Steps';
import { SimulationView, Step18EndSimulation } from '@/components/steps/Phase5Simulation';
import { Step19Scores, Step20Feedback, Step21Ressources } from '@/components/steps/Phase6Analysis';
import { Step22Nps, Step23Ratings, Step24Ameliorations, Step25Closing, Step26GrilleEntretien } from '@/components/steps/Phase7Feedback';

function StepRenderer({ step }: { step: number }) {
  const { choixPreSimulation } = useParcoursStore();

  switch (step) {
    case 1: return <Step1Welcome />;
    case 2: return <Step2Profil />;
    case 5: return <Step5Objectifs />;
    case 6: return <Step6Difficultes />;
    case 7: return <Step7TypeCollab />;
    case 8: return <Step8Complement />;
    case 11: return <Step11Disc />;
    case 12: return <Step12Relation />;
    case 13: return <Step13EtatEsprit />;
    case 14: return <Step14RecapPersona />;
    case 15:
      if (choixPreSimulation === 'theorie') return <Step15bTheory />;
      return <Step15PreSimulation />;
    case 16: return <><Step15c /><SimulationView /></>;
    case 17: return <SimulationView key="sim-continue" />;
    case 18: return <Step18EndSimulation />;
    case 19: return <Step19Scores />;
    case 20: return <Step20Feedback />;
    case 21: return <Step21Ressources />;
    case 22: return <Step22Nps />;
    case 23: return <Step23Ratings />;
    case 24: return <Step24Ameliorations />;
    case 25: return <Step25Closing />;
    case 26: return <Step26GrilleEntretien />;
    default: return <Step1Welcome />;
  }
}

const isSimulationStep = (step: number) => step >= 16 && step <= 17;

const SKIPPABLE_STEPS = [5, 6, 8, 11, 12, 13, 24];

interface ChatPageProps {
  activeSlug?: string;
}

export default function ChatPage({ activeSlug }: ChatPageProps) {
  const currentStep = useParcoursStore((s) => s.currentStep);
  const prevStep = useParcoursStore((s) => s.prevStep);
  const skipStep = useParcoursStore((s) => s.skipStep);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }, [currentStep]);

  const handleChatSend = useCallback((_message: string) => {
  }, []);

  const showChatInput = !isSimulationStep(currentStep);
  const canGoBack = currentStep > 1;
  const canSkip = SKIPPABLE_STEPS.includes(currentStep);

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="chat-page">
      <header className="border-b border-[var(--dsfr-grey-925)] bg-white dark:bg-[var(--dsfr-grey-975)] sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <img src={franceTravailLogo} alt="France Travail" className="h-8 w-auto" />
              <div className="h-8 w-px bg-[var(--dsfr-grey-925)]" />
              <div>
                <h1 className="font-bold text-sm text-[var(--dsfr-blue-france)] leading-tight">ChatFT SimuManager</h1>
                <p className="text-[11px] text-[var(--dsfr-grey-425)] font-medium">Entrainement managerial</p>
              </div>
            </div>
          </div>
          <ProgressBar />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SideMenu activeSlug={activeSlug} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 min-h-full">
              <StepRenderer step={currentStep} />
            </div>
          </div>

          {showChatInput && (
            <div className="border-t border-[var(--dsfr-grey-925)] bg-white dark:bg-[var(--dsfr-grey-975)]">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
                <ChatInput
                  onSend={handleChatSend}
                  label="Pose ta question ... Win+H pour la dicter"
                  placeholder="Saisis ton prompt"
                  showNav={currentStep > 1}
                  canGoBack={canGoBack}
                  canSkip={canSkip}
                  onBack={prevStep}
                  onSkip={skipStep}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
