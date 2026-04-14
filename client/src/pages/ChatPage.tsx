import { useRef, useEffect, useCallback, useState } from 'react';
import { useParcoursStore, canGoBackFromStep } from '@/lib/store';
import { ProgressBar } from '@/components/ProgressBar';
import { ChatInput } from '@/components/ChatInput';
import { SideMenu } from '@/components/SideMenu';
import { BackButton } from '@/components/BackButton';
import franceTravailLogo from '@assets/image_1771580674143.png';
import { Step1Welcome, Step2Profil, Step4Experience, Step5Objectifs, Step6Difficultes, Step7TypeCollab, Step8Complement } from '@/components/steps/Phase1Steps';
import { Step11Disc, Step12Relation, Step13EtatEsprit, Step14RecapPersona } from '@/components/steps/Phase3Steps';
import { Step15PreSimulation, Step15bTheory, Step15c, Step27DureeEntretien } from '@/components/steps/Phase4Steps';
import { SimulationView, Step18EndSimulation } from '@/components/steps/Phase5Simulation';
import { Step19Scores, Step20Feedback, Step21Ressources } from '@/components/steps/Phase6Analysis';
import { Step22Nps, Step23Ratings, Step24Ameliorations, Step25Closing, Step26GrilleEntretien } from '@/components/steps/Phase7Feedback';
import { MessageCircle, X } from 'lucide-react';

function StepRenderer({ step }: { step: number }) {
  const { choixPreSimulation } = useParcoursStore();

  switch (step) {
    case 1: return <Step1Welcome />;
    case 2: return <Step2Profil />;
    case 4: return <Step4Experience />;
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
    case 27: return <Step27DureeEntretien />;
    default: return <Step1Welcome />;
  }
}

const isSimulationStep = (step: number) => step >= 16 && step <= 17;

const SKIPPABLE_STEPS = [5, 6, 8, 11, 12, 13, 24];

interface InfoMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPageProps {
  activeSlug?: string;
}

export default function ChatPage({ activeSlug }: ChatPageProps) {
  const currentStep = useParcoursStore((s) => s.currentStep);
  const scenarioChoisi = useParcoursStore((s) => s.scenarioChoisi);
  const prevStep = useParcoursStore((s) => s.prevStep);
  const skipStep = useParcoursStore((s) => s.skipStep);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [infoMessages, setInfoMessages] = useState<InfoMessage[]>([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [showInfoChat, setShowInfoChat] = useState(false);
  const infoChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }, [currentStep]);

  useEffect(() => {
    if (infoChatRef.current) {
      infoChatRef.current.scrollTop = infoChatRef.current.scrollHeight;
    }
  }, [infoMessages, showInfoChat]);

  const handleInfoSend = useCallback(async (message: string) => {
    setInfoMessages(prev => [...prev, { role: 'user', content: message }]);
    setInfoLoading(true);
    setShowInfoChat(true);
    try {
      const res = await fetch('/api/info/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: message,
          scenario: scenarioChoisi,
          currentStep,
        }),
      });
      const data = await res.json();
      setInfoMessages(prev => [...prev, { role: 'assistant', content: data.response || "Erreur lors du traitement." }]);
    } catch {
      setInfoMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue. Réessaie dans un instant." }]);
    } finally {
      setInfoLoading(false);
    }
  }, [scenarioChoisi, currentStep]);

  const isSimulation = isSimulationStep(currentStep);
  const showChatInput = !isSimulation;
  const canGoBack = canGoBackFromStep(currentStep);
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
                <p className="text-[11px] text-[var(--dsfr-grey-425)] font-medium">Entraînement managérial</p>
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
              <BackButton />
              <StepRenderer step={currentStep} />
            </div>
          </div>

          {showChatInput && (
            <div className="border-t border-[var(--dsfr-grey-925)] bg-[var(--dsfr-grey-975)] relative">
              {showInfoChat && infoMessages.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-[var(--dsfr-grey-950)] border-t border-[var(--dsfr-grey-925)] shadow-lg max-h-64 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--dsfr-grey-925)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--dsfr-blue-france)]">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Assistant ChatFT
                    </div>
                    <button
                      onClick={() => setShowInfoChat(false)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-grey-200)] hover:bg-[var(--dsfr-grey-925)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div ref={infoChatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {infoMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-[var(--dsfr-blue-france)] text-white'
                              : 'bg-[var(--dsfr-grey-950)] dark:bg-[var(--dsfr-grey-900)] text-foreground border border-[var(--dsfr-grey-925)]'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {infoLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[var(--dsfr-grey-950)] dark:bg-[var(--dsfr-grey-900)] border border-[var(--dsfr-grey-925)] rounded-lg px-3 py-2 text-sm text-[var(--dsfr-grey-425)]">
                          <span className="animate-pulse">En train de répondre...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
                {!showInfoChat && infoMessages.length > 0 && (
                  <button
                    onClick={() => setShowInfoChat(true)}
                    className="flex items-center gap-1.5 text-xs text-[var(--dsfr-blue-france)] hover:underline mb-1.5"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Voir les réponses de l'assistant ({infoMessages.filter(m => m.role === 'assistant').length})
                  </button>
                )}
                <ChatInput
                  onSend={handleInfoSend}
                  label="Pose ta question ... Win+H pour la dicter"
                  placeholder="Pose une question sur l'outil ou le management"
                  showNav={currentStep > 1}
                  canGoBack={canGoBack}
                  canSkip={canSkip}
                  onBack={prevStep}
                  onSkip={skipStep}
                  disabled={infoLoading}
                  muted={true}
                  ignorePendingMessage={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
