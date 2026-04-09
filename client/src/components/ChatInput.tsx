import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ChevronLeft, SkipForward, Mic } from 'lucide-react';
import { useParcoursStore } from '@/lib/store';

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
  showFileUpload?: boolean;
  onFileUpload?: (files: FileList) => void;
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
  showFileUpload = false,
  onFileUpload,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingMessage = useParcoursStore((s) => s.pendingMessage);
  const setPendingMessage = useParcoursStore((s) => s.setPendingMessage);

  useEffect(() => {
    if (pendingMessage) {
      setValue(pendingMessage);
      setPendingMessage(null);
      setTimeout(() => {
        onSend(pendingMessage);
        setValue('');
      }, 350);
    }
  }, [pendingMessage, onSend, setPendingMessage]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full" data-testid="chat-input-bar">
      {label && (
        <p className="text-xs text-[var(--dsfr-grey-425)] mb-1.5 font-medium">{label}</p>
      )}
      <div className="flex items-center gap-2">
        {showNav && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              data-testid="button-back"
              onClick={onBack}
              disabled={!canGoBack}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)] text-[var(--dsfr-grey-425)] hover:border-[var(--dsfr-blue-france)] hover:text-[var(--dsfr-blue-france)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Retour"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              data-testid="button-skip"
              onClick={onSkip}
              disabled={!canSkip}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)] text-[var(--dsfr-grey-425)] hover:border-[var(--dsfr-blue-france)] hover:text-[var(--dsfr-blue-france)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Passer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center border border-[var(--dsfr-grey-850)] bg-white dark:bg-[var(--dsfr-grey-950)] rounded-lg overflow-hidden">
          <input
            ref={inputRef}
            data-testid="input-chat"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-foreground placeholder:text-[var(--dsfr-grey-425)]"
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.odt,.rtf,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
          />
          <button
            data-testid="button-attach"
            className="flex items-center gap-1.5 px-3 py-2 mr-1 text-xs font-medium rounded-md transition-colors hover:bg-[var(--dsfr-blue-france-light)]"
            style={{ color: 'var(--dsfr-blue-france)' }}
            onClick={handleFileClick}
            type="button"
          >
            <Paperclip className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un fichier</span>
          </button>
          <button
            data-testid="button-mic"
            className="flex items-center justify-center w-9 h-9 mr-1 rounded-md text-[var(--dsfr-grey-425)] hover:text-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)] transition-colors"
            type="button"
            title="Saisie vocale disponible en simulation"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          data-testid="button-send-chat"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: 'var(--dsfr-blue-france)' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-center text-[var(--dsfr-grey-425)] mt-1.5">
        ChatFT peut faire des erreurs. Pensez a verifier les informations.
      </p>
    </div>
  );
}
