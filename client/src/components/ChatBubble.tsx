import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'bot' | 'user';
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function ChatBubble({ role, children, className, animate = true }: ChatBubbleProps) {
  return (
    <div
      data-testid={`chat-bubble-${role}`}
      className={cn(
        'flex gap-3 max-w-[90%]',
        role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
        animate && 'animate-in fade-in slide-in-from-bottom-2 duration-300',
        className,
      )}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
        style={{
          backgroundColor: role === 'bot' ? 'var(--dsfr-blue-france)' : 'var(--dsfr-grey-925)',
          color: role === 'bot' ? '#FFFFFF' : 'var(--dsfr-grey-425)',
        }}
      >
        {role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          'px-4 py-3 text-sm leading-relaxed',
          role === 'bot'
            ? 'rounded-r-lg rounded-bl-lg text-foreground'
            : 'text-white rounded-l-lg rounded-br-lg',
        )}
        style={role === 'bot'
          ? { backgroundColor: 'var(--dsfr-blue-france-light)', borderLeft: '3px solid var(--dsfr-blue-france)' }
          : { backgroundColor: 'var(--dsfr-blue-france)' }
        }
      >
        {children}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div data-testid="typing-indicator" className="flex gap-3 max-w-[90%] mr-auto animate-in fade-in duration-300">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
        style={{ backgroundColor: 'var(--dsfr-blue-france)', color: '#FFFFFF' }}
      >
        <Bot className="w-4 h-4" />
      </div>
      <div
        className="rounded-r-lg rounded-bl-lg px-4 py-3 flex gap-1.5 items-center"
        style={{ backgroundColor: 'var(--dsfr-blue-france-light)', borderLeft: '3px solid var(--dsfr-blue-france)' }}
      >
        <div className="w-2 h-2 rounded-full opacity-50 animate-bounce" style={{ backgroundColor: 'var(--dsfr-blue-france)', animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full opacity-50 animate-bounce" style={{ backgroundColor: 'var(--dsfr-blue-france)', animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full opacity-50 animate-bounce" style={{ backgroundColor: 'var(--dsfr-blue-france)', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
