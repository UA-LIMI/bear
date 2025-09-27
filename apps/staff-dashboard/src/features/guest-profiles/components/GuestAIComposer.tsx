"use client";

import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { GuestProfile } from '@/lib/types/supabase';

interface GuestAIComposerProps {
  guest: GuestProfile;
}

const defaultPrompt =
  'Draft a personalized welcome message summarizing the guest\'s current stay, priorities, and ideal next touchpoint.';

export const GuestAIComposer = ({ guest }: GuestAIComposerProps) => {
  const [instructions, setInstructions] = useState(defaultPrompt);

  const { completion, complete, isLoading, error, setCompletion } = useCompletion({
    api: '/api/ai/guest-insight',
  });

  const handleGenerate = async () => {
    await complete(instructions, {
      body: {
        guest,
      },
    });
  };

  const handleReset = () => {
    setInstructions(defaultPrompt);
    setCompletion('');
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">AI concierge assistant</CardTitle>
        <CardDescription>
          Use the AI SDK to craft bespoke messaging or follow-up actions tailored to this guest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground" htmlFor="ai-instructions">
            Prompt instructions
          </label>
          <textarea
            id="ai-instructions"
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50"
            value={instructions}
            onChange={event => setInstructions(event.target.value)}
            placeholder="Describe the task you want the concierge assistant to perform..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate insight'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
          {error && <span className="text-sm text-destructive">{error.message}</span>}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">AI suggestion</p>
          <div className="rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            {completion ? (
              <pre className="whitespace-pre-wrap text-left text-sm text-foreground">{completion}</pre>
            ) : (
              <span className="italic text-muted-foreground">Output will appear here.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
