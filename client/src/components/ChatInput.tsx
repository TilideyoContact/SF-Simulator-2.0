import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, SkipForward } from 'lucide-react';
import { useParcoursStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  showNav?: boolean;
  canGoBack?: boolean;
  canSkip?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  ignorePendingMessage?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = 'Saisis ton prompt',
  disabled = false,
  label,
  showNav = false,
  canGoBack = false,
  canSkip = false,
  onBack,
  onSkip,
  ignorePendingMessage = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingMessage = useParcoursStore((s) => s.pendingMessage);
  const setPendingMessage = useParcoursStore((s) => s.setPendingMessage);
  const currentStep = useParcoursStore((s) => s.currentStep);
  const isEnabled = currentStep === 16 || currentStep === 17;

  useEffect(() => {
    if (pendingMessage && !ignorePendingMessage && isEnabled) {
      setValue(pendingMessage);
      setPendingMessage(null);
      setTimeout(() => {
        onSend(pendingMessage);
        setValue('');
      }, 350);
    }
  }, [pendingMessage, onSend, setPendingMessage, ignorePendingMessage, isEnabled]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || !isEnabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const effectiveDisabled = disabled || !isEnabled;
  const effectivePlaceholder = isEnabled
    ? 'Écris ton message...'
    : 'Le chat est disponible uniquement pendant la simulation';

  return (
    <div
      className={cn('w-full', !isEnabled && 'opacity-50 pointer-events-none')}
      data-testid="chat-input-bar"
    >
      {label && (
        <p className="text-xs text-[var(--dsfr-grey-425)] mb-1.5 font-medium">{label}</p>
      )}
      <div className="flex items-center gap-2">
        {showNav && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              data-testid="button-back"
              onClick={onBack}
              disabled={!canGoBack || effectiveDisabled}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)] text-[var(--dsfr-grey-425)] hover:border-[var(--dsfr-blue-france)] hover:text-[var(--dsfr-blue-france)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Retour"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              data-testid="button-skip"
              onClick={onSkip}
              disabled={!canSkip || effectiveDisabled}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)] text-[var(--dsfr-grey-425)] hover:border-[var(--dsfr-blue-france)] hover:text-[var(--dsfr-blue-france)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Passer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={cn(
          'flex-1 flex items-center border rounded-lg overflow-hidden',
          effectiveDisabled
            ? 'border-[var(--dsfr-grey-900)] bg-[var(--dsfr-grey-975)]'
            : 'border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)]'
        )}>
          <input
            ref={inputRef}
            data-testid="input-chat"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={effectivePlaceholder}
            disabled={effectiveDisabled}
            className={cn(
              'flex-1 px-4 py-3 text-sm bg-transparent outline-none placeholder:text-[var(--dsfr-grey-425)]',
              effectiveDisabled ? 'text-[var(--dsfr-grey-425)] cursor-not-allowed' : 'text-foreground'
            )}
          />
        </div>
        <button
          data-testid="button-send-chat"
          onClick={handleSend}
          disabled={!value.trim() || effectiveDisabled}
          className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: 'var(--dsfr-blue-france)' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-center text-[var(--dsfr-grey-425)] mt-1.5">
        ChatFT peut faire des erreurs. Pense à vérifier les informations.
      </p>
    </div>
  );
}
