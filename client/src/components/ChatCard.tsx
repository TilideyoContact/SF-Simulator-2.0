import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CardOption {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
}

interface ChatCardSingleProps {
  options: CardOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  autoFillInput?: boolean;
}

export function ChatCardSingle({ options, selected, onSelect, orientation = 'vertical', disabled }: ChatCardSingleProps) {
  const handleSelect = (opt: CardOption) => {
    onSelect(opt.id);
  };

  return (
    <div
      data-testid="card-single"
      className={cn(
        'flex gap-3 flex-wrap',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
      )}
    >
      {options.map((opt, i) => (
        <button
          key={opt.id}
          data-testid={`card-option-${opt.id}`}
          disabled={disabled}
          onClick={() => handleSelect(opt)}
          className={cn(
            'relative flex items-start gap-3 px-4 py-3 text-left transition-all duration-200 border',
            orientation === 'horizontal' ? 'flex-1 min-w-[200px]' : 'w-full',
            selected === opt.id
              ? 'bg-[var(--dsfr-blue-france-light)] border-[var(--dsfr-blue-france)] shadow-sm'
              : 'bg-card border-[var(--dsfr-grey-925)] hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)]',
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer',
            'animate-in fade-in slide-in-from-bottom-1',
          )}
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
        >
          {opt.badge && (
            <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-bold bg-[var(--dsfr-blue-france)] text-white uppercase tracking-wider">
              {opt.badge}
            </span>
          )}
          {opt.icon && (
            <div className={cn('flex-shrink-0 w-10 h-10 rounded flex items-center justify-center text-lg', opt.color || 'bg-[var(--dsfr-blue-france-medium)] text-[var(--dsfr-blue-france)]')}>
              {opt.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground">{opt.label}</div>
            {opt.subtitle && (
              <div className="text-xs text-[var(--dsfr-grey-425)] mt-0.5 leading-relaxed">{opt.subtitle}</div>
            )}
          </div>
          {selected === opt.id && (
            <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-[var(--dsfr-blue-france)] text-white flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

interface ChatCardMultiProps {
  options: CardOption[];
  selected: string[];
  onToggle: (id: string) => void;
  exclusiveOptionId?: string;
  disabled?: boolean;
}

export function ChatCardMulti({ options, selected, onToggle, exclusiveOptionId, disabled }: ChatCardMultiProps) {
  const handleToggle = (id: string) => {
    if (disabled) return;
    if (id === exclusiveOptionId) {
      onToggle(id);
      return;
    }
    if (selected.includes(exclusiveOptionId || '')) {
      onToggle(id);
      return;
    }
    onToggle(id);
  };

  return (
    <div data-testid="card-multi" className="flex flex-col gap-3">
      {options.map((opt, i) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            data-testid={`card-option-${opt.id}`}
            disabled={disabled}
            onClick={() => handleToggle(opt.id)}
            className={cn(
              'flex items-start gap-3 px-4 py-3 border text-left transition-all duration-200',
              isSelected
                ? 'bg-[var(--dsfr-blue-france-light)] border-[var(--dsfr-blue-france)] shadow-sm'
                : 'bg-card border-[var(--dsfr-grey-925)] hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)]',
              disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
              'animate-in fade-in slide-in-from-bottom-1',
            )}
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            <div className={cn(
              'flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center mt-0.5 transition-colors',
              isSelected ? 'bg-[var(--dsfr-blue-france)] border-[var(--dsfr-blue-france)]' : 'border-[var(--dsfr-grey-850)]',
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            {opt.icon && (
              <div className={cn('flex-shrink-0 w-10 h-10 rounded flex items-center justify-center text-lg', opt.color || 'bg-[var(--dsfr-blue-france-medium)] text-[var(--dsfr-blue-france)]')}>
                {opt.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">{opt.label}</div>
              {opt.subtitle && (
                <div className="text-xs text-[var(--dsfr-grey-425)] mt-0.5 leading-relaxed">{opt.subtitle}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface NpsCardProps {
  selected: number | null;
  onSelect: (n: number) => void;
  disabled?: boolean;
}

export function NpsCard({ selected, onSelect, disabled }: NpsCardProps) {
  const handleSelect = (n: number) => {
    onSelect(n);
  };

  return (
    <div data-testid="nps-card" className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between text-xs text-[var(--dsfr-grey-425)] px-1 font-medium">
        <span>Pas du tout probable</span>
        <span>Tres probable</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            data-testid={`nps-${i}`}
            disabled={disabled}
            onClick={() => handleSelect(i)}
            className={cn(
              'flex-1 h-10 text-sm font-medium transition-all duration-200',
              selected === i
                ? 'ring-2 ring-offset-1 scale-105'
                : '',
              disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer hover:opacity-80',
              i <= 6
                ? selected === i
                  ? 'bg-[var(--dsfr-red-marianne)] text-white ring-[var(--dsfr-red-marianne)]'
                  : 'bg-[var(--dsfr-red-marianne-light)] text-[var(--dsfr-red-marianne)]'
                : i <= 8
                ? selected === i
                  ? 'bg-[var(--dsfr-warning)] text-white ring-[var(--dsfr-warning)]'
                  : 'bg-[var(--dsfr-warning-light)] text-[var(--dsfr-warning)]'
                : selected === i
                ? 'bg-[var(--dsfr-success)] text-white ring-[var(--dsfr-success)]'
                : 'bg-[var(--dsfr-success-bg)] text-[var(--dsfr-success)]',
            )}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RatingCardProps {
  label: string;
  selected: number | null;
  onSelect: (n: number) => void;
  minLabel: string;
  maxLabel: string;
  disabled?: boolean;
}

export function RatingCard({ label, selected, onSelect, minLabel, maxLabel, disabled }: RatingCardProps) {
  const handleSelect = (n: number) => {
    onSelect(n);
  };

  return (
    <div data-testid="rating-card" className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-sm font-bold text-foreground">{label}</div>
      <div className="flex justify-between text-xs text-[var(--dsfr-grey-425)] px-1 font-medium">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            data-testid={`rating-${n}`}
            disabled={disabled}
            onClick={() => handleSelect(n)}
            className={cn(
              'flex-1 h-10 text-sm font-medium transition-all duration-200',
              selected === n
                ? 'bg-[var(--dsfr-blue-france)] text-white ring-2 ring-offset-1 ring-[var(--dsfr-blue-france)]'
                : 'bg-card border border-[var(--dsfr-grey-925)] hover:border-[var(--dsfr-blue-france)] hover:bg-[var(--dsfr-blue-france-light)]',
              disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
