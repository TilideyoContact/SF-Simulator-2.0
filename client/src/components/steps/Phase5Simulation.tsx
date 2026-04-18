import { useState, useRef, useEffect, useCallback } from 'react';
import { useParcoursStore } from '@/lib/store';
import { ChatBubble, TypingIndicator } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getScenarioLabel, getDiscLabel, getTourMax } from '@/lib/helpers';
import { Send, Mic, MicOff, Volume2, VolumeX, Clock, Pause, Play, Square } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function SimulationView() {
  const store = useParcoursStore();
  const { simulation, persona, typeCollab, scenarioChoisi, addSimulationMessage, setSimulationFinished, nextStep } = store;
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const tourMax = simulation.tourMax || getTourMax(scenarioChoisi, typeCollab);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulation.messages, isTyping]);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      fetchFirstMessage();
    }
  }, []);

  useEffect(() => {
    if (simulation.messages.length > 0 && !simulation.isFinished && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    if ((simulation.isFinished || isPaused) && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simulation.messages.length, simulation.isFinished, isPaused]);

  const handleTogglePause = () => {
    setIsPaused(prev => {
      if (!prev) stopAudio();
      return !prev;
    });
  };

  const handleConfirmStop = () => {
    setShowStopConfirm(false);
    setIsPaused(false);
    setSimulationFinished();
    useParcoursStore.setState({ currentStep: 18 });
  };

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const playTTS = useCallback(async (text: string) => {
    if (!soundEnabled) return;

    const cleanText = text.replace(/\*\[.*?\]\*/g, '').replace(/\*.*?\*/g, '').trim();
    if (!cleanText) return;

    try {
      setIsPlayingAudio(true);
      const response = await fetch('/api/speech/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, disc: persona.disc }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsPlayingAudio(false);
    }
  }, [soundEnabled]);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  const fetchFirstMessage = async () => {
    setIsTyping(true);
    try {
      const res = await apiRequest('POST', '/api/simulation/start', {
        scenario: scenarioChoisi,
        typeCollab,
        disc: persona.disc,
        relation: persona.relation,
        etatEsprit: persona.etatEsprit,
        niveauDifficulte: persona.niveauDifficulte,
        prenomFictif: persona.prenomFictif,
        profil: store.profil,
        experience: store.experience,
        barometre: store.barometre,
        objectifs: store.objectifs,
        complement: store.complement,
        mode: store.mode,
        dureeEntretien: store.dureeEntretien,
        tourMax,
      });
      const data = await res.json();
      addSimulationMessage({
        role: 'collaborateur',
        content: data.message,
        timestamp: new Date().toISOString(),
      });
      useParcoursStore.setState({
        simulation: {
          ...useParcoursStore.getState().simulation,
          tourMax,
          isSimulating: true,
        },
        sessionId: data.sessionId,
      });
      playTTS(data.message);
    } catch {
      const fallback = getDefaultFirstMessage();
      addSimulationMessage({
        role: 'collaborateur',
        content: fallback,
        timestamp: new Date().toISOString(),
      });
      useParcoursStore.setState({
        simulation: {
          ...useParcoursStore.getState().simulation,
          tourMax,
          isSimulating: true,
        },
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getDefaultFirstMessage = (): string => {
    const name = persona.prenomFictif;
    if (persona.disc === 'dominant' && persona.etatEsprit === 'agace') {
      return `*[${name} entre, pose ses documents sur la table sans s'asseoir.]*\n\nBon, tu voulais me voir. Je te préviens, j'ai un comité dans 30 minutes. De quoi s'agit-il ?`;
    }
    if (persona.disc === 'stable') {
      return `*[${name} entre dans le bureau et s'assoit calmement.]*\n\nBonjour. Tu m'as demandé de passer te voir, j'espère que ce ne sera pas trop long, j'ai beaucoup de dossiers en attente. Je t'écoute.`;
    }
    if (persona.disc === 'influent') {
      return `*[${name} entre avec enthousiasme.]*\n\nBonjour ! Ça va bien ? J'ai eu une matinée chargée mais bon, ça fait du bien de changer d'air. Tu avais quelque chose à me dire ?`;
    }
    return `*[${name} entre et s'installe.]*\n\nBonjour. J'ai reçu ton invitation pour cet entretien. Qu'as-tu à me dire ?`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeRecording = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      if (data.text) {
        setInput(prev => prev ? `${prev} ${data.text}` : data.text);
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const finKeywords = ['/fin', '/analyse', 'fin', 'stop', 'débrief', 'debrief', 'bilan', 'analyse'];
    if (finKeywords.includes(text.toLowerCase())) {
      setInput('');
      setSimulationFinished();
      useParcoursStore.setState({ currentStep: 18 });
      return;
    }

    addSimulationMessage({
      role: 'manager',
      content: text,
      timestamp: new Date().toISOString(),
    });
    setInput('');

    const currentTour = useParcoursStore.getState().simulation.tourActuel;
    if (currentTour >= tourMax) {
      setTimeout(() => {
        setSimulationFinished();
        useParcoursStore.setState({ currentStep: 18 });
      }, 500);
      return;
    }

    setIsTyping(true);
    try {
      const res = await apiRequest('POST', '/api/simulation/respond', {
        sessionId: store.sessionId,
        message: text,
        tourActuel: currentTour,
        tourMax,
        scenario: scenarioChoisi,
        disc: persona.disc,
        relation: persona.relation,
        etatEsprit: persona.etatEsprit,
        typeCollab,
        prenomFictif: persona.prenomFictif,
        messages: useParcoursStore.getState().simulation.messages,
        profil: store.profil,
        objectifs: store.objectifs,
        complement: store.complement,
        mode: store.mode,
        dureeEntretien: store.dureeEntretien,
      });
      const data = await res.json();
      addSimulationMessage({
        role: 'collaborateur',
        content: data.message,
        timestamp: new Date().toISOString(),
      });

      playTTS(data.message);

      if (data.isFinished) {
        setTimeout(() => {
          setSimulationFinished();
          useParcoursStore.setState({ currentStep: 18 });
        }, 1000);
      }
    } catch {
      addSimulationMessage({
        role: 'collaborateur',
        content: "Je comprends ce que tu dis. Peux-tu développer ta pensée ?",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSound = () => {
    if (soundEnabled) {
      stopAudio();
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-2 px-1 flex-wrap">
        <div className="flex items-center gap-3 text-xs font-medium text-[var(--dsfr-grey-425)]">
          <span data-testid="text-tour-counter" className="tabular-nums">
            Tour {Math.min(simulation.tourActuel, tourMax)}/{tourMax}
          </span>
          {!simulation.isFinished && (
            <>
              <Button
                data-testid="button-pause-toggle"
                variant="ghost"
                size="icon"
                onClick={handleTogglePause}
                className="h-7 w-7 text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-blue-france)]"
                title={isPaused ? 'Reprendre' : 'Mettre en pause'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                data-testid="button-stop-simulation"
                variant="ghost"
                size="icon"
                onClick={() => setShowStopConfirm(true)}
                className="h-7 w-7 text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-blue-france)]"
                title="Terminer la simulation"
              >
                <Square className="w-4 h-4" />
              </Button>
            </>
          )}
          <span className="flex items-center gap-1 tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            {isPaused && (
              <span data-testid="text-paused" className="ml-1 italic text-[var(--dsfr-grey-625)] font-normal">
                — En pause
              </span>
            )}
          </span>
        </div>
        <Button
          data-testid="button-toggle-sound"
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className={cn(
            "gap-1.5 text-xs",
            soundEnabled ? "text-primary" : "text-muted-foreground"
          )}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {soundEnabled ? "Son activé" : "Son coupé"}
        </Button>
      </div>

      <Dialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold" style={{ color: 'var(--dsfr-blue-france)' }}>
              Terminer la simulation ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--dsfr-grey-425)]">
            Tu seras redirigé vers le débrief.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              data-testid="button-stop-cancel"
              variant="outline"
              onClick={() => setShowStopConfirm(false)}
            >
              Continuer la simulation
            </Button>
            <Button
              data-testid="button-stop-confirm"
              onClick={handleConfirmStop}
            >
              Oui, terminer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 space-y-4 pb-4">
        {simulation.messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role === 'manager' ? 'user' : 'bot'}>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {!simulation.isFinished && (
        <div className="sticky bottom-0 bg-background pt-3 pb-1 border-t border-[var(--dsfr-grey-925)]">
          <div className="w-full h-2 bg-[var(--dsfr-grey-925)] rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min((simulation.tourActuel / tourMax) * 100, 100)}%`,
                background: simulation.tourActuel / tourMax < 0.5
                  ? 'var(--dsfr-blue-france)'
                  : simulation.tourActuel / tourMax < 0.8
                    ? 'var(--dsfr-warning)'
                    : 'var(--dsfr-error)',
              }}
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button
              data-testid="button-mic"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTyping || isTranscribing}
              className={cn(
                "shrink-0",
                isRecording && "animate-pulse"
              )}
              title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Textarea
              ref={textareaRef}
              data-testid="input-simulation"
              placeholder={isTranscribing ? "Transcription en cours..." : "Écris ton message en tant que manager..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="min-h-[60px] max-h-[120px] resize-none flex-1"
              disabled={isTyping || isTranscribing}
            />
            <Button
              data-testid="button-send"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {isTranscribing && (
            <p data-testid="text-transcribing" className="text-xs text-muted-foreground mt-1 px-1 animate-pulse">
              Transcription de ton message vocal...
            </p>
          )}
          {isRecording && (
            <p data-testid="text-recording" className="text-xs text-destructive mt-1 px-1 animate-pulse">
              Enregistrement en cours... Clique pour arrêter
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Step18EndSimulation() {
  const { nextStep } = useParcoursStore();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      nextStep();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <ChatBubble role="bot">
        <div className="space-y-2">
          <p className="font-semibold text-center">--- FIN DE LA SIMULATION ---</p>
          <p>Bravo d'avoir mené cet entretien jusqu'au bout !</p>
          <p>Je vais maintenant analyser notre échange. Un instant...</p>
        </div>
      </ChatBubble>
      {showLoading && <TypingIndicator />}
    </div>
  );
}
