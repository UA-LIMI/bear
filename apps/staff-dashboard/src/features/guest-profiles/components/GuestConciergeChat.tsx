"use client";

import { useMemo, useRef, useState } from 'react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { GuestProfile } from '@/lib/types/supabase';

import { cn } from '@/lib/utils';

interface GuestConciergeChatProps {
  guest: GuestProfile;
}

type Suggestion = {
  title: string;
  description: string;
  channel: string;
  impact: 'high' | 'medium';
};

type GuestSummary = {
  name: string;
  vipStatus: string;
  stay: {
    room: string;
    checkIn: string | null;
    checkOut: string | null;
  };
  preferences: {
    dining: string[];
    activities: string[];
    roomService: string[];
  };
  highlights: string[];
  keyPoints: string[];
};

type ConciergeMetadata = {
  model?: string;
  totalTokens?: number;
};

type ConciergeTools = {
  showGuestSummary: {
    input: Record<string, never>;
    output: GuestSummary;
  };
  proposeDelightIdeas: {
    input: { focus?: string };
    output: { suggestions: Suggestion[] };
  };
};

type ConciergeMessage = UIMessage<ConciergeMetadata, never, ConciergeTools>;

type MessagePart = ConciergeMessage['parts'][number];

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const GuestSummaryCard = ({ summary }: { summary: GuestSummary }) => {
  const { stay, preferences } = summary;

  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{summary.name}</p>
          <p className="text-xs text-muted-foreground">Room {stay.room}</p>
        </div>
        <Badge variant="secondary" className="uppercase">
          {summary.vipStatus || 'Standard'}
        </Badge>
      </div>

      <Separator className="my-3" />

      <dl className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="font-medium text-foreground">Stay window</dt>
          <dd>
            {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-foreground">Dining</dt>
          <dd>{preferences.dining.join(', ') || 'Not captured'}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-foreground">Activities</dt>
          <dd>{preferences.activities.join(', ') || 'Not captured'}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-foreground">Room service</dt>
          <dd>{preferences.roomService.join(', ') || 'Not captured'}</dd>
        </div>
      </dl>

      {summary.keyPoints.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Highlights</p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {summary.keyPoints.slice(0, 4).map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SuggestionsList = ({ suggestions }: { suggestions: Suggestion[] }) => (
  <div className="space-y-3">
    {suggestions.map(suggestion => (
      <div key={`${suggestion.title}-${suggestion.channel}`} className="rounded-lg border border-dashed bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
          <Badge variant={suggestion.impact === 'high' ? 'default' : 'outline'}>{suggestion.impact}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{suggestion.description}</p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Channel: {suggestion.channel}</p>
      </div>
    ))}
  </div>
);

const renderPart = (part: MessagePart) => {
  switch (part.type) {
    case 'text':
      return <p className="whitespace-pre-wrap text-sm text-foreground">{part.text}</p>;
    case 'tool-showGuestSummary':
      if (part.state === 'input-available') {
        return <p className="text-xs italic text-muted-foreground">Fetching guest summary…</p>;
      }
      if (part.state === 'output-error') {
        return <p className="text-xs text-destructive">Error loading summary: {part.errorText}</p>;
      }
      if (part.state === 'output-available' && part.output) {
        return <GuestSummaryCard summary={part.output as GuestSummary} />;
      }
      return null;
    case 'tool-proposeDelightIdeas':
      if (part.state === 'input-available') {
        return <p className="text-xs italic text-muted-foreground">Assembling delight ideas…</p>;
      }
      if (part.state === 'output-error') {
        return <p className="text-xs text-destructive">Error generating ideas: {part.errorText}</p>;
      }
      if (part.state === 'output-available' && part.output) {
        const { suggestions } = part.output as { suggestions: Suggestion[] };
        return <SuggestionsList suggestions={suggestions} />;
      }
      return null;
    default:
      return null;
  }
};

export const GuestConciergeChat = ({ guest }: GuestConciergeChatProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/concierge-chat',
        body: () => ({ guest }),
      }),
    [guest]
  );

  const { messages, sendMessage, status, error } = useChat<ConciergeMessage>({
    id: guest.id ?? guest.email ?? `guest-${guest.name}`,
    transport,
  });

  const isStreaming = status === 'submitted' || status === 'streaming';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleQuickPrompt = async (prompt: string) => {
    await sendMessage({ text: prompt });
  };

  const quickPrompts = [
    'Summarize the guest and suggest a surprise amenity for this evening.',
    'What should the concierge say when checking in tomorrow morning?',
    'Recommend a multi-day engagement plan tailored to this guest.',
  ];

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">Concierge AI copilot</CardTitle>
        <CardDescription>
          Ask questions about this guest and get actionable suggestions. The model can call tools to
          review their profile and propose delight ideas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map(prompt => (
            <Button
              key={prompt}
              type="button"
              variant="secondary"
              size="sm"
              disabled={isStreaming}
              onClick={() => handleQuickPrompt(prompt)}
            >
              {prompt.replace('Summarize the guest and ', '').slice(0, 40)}…
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        <ScrollArea className="h-[320px] rounded-lg border bg-muted/20">
          <div ref={scrollRef} className="space-y-4 p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Start the conversation with a question or choose one of the quick prompts above.
              </p>
            )}
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border p-4',
                  message.role === 'user'
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-border bg-background'
                )}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>{message.role === 'user' ? 'Team member' : 'Concierge AI'}</span>
                </div>
                <div className="space-y-3">
                  {message.parts.map((part, index) => (
                    <div key={`${message.id}-${index}`}>{renderPart(part)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Ask the concierge AI…"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
