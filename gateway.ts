import { streamText } from 'ai';

async function main() {
  const result = streamText({
    model: 'google/gemini-2.5-flash',
    prompt: 'What is the history of the San Francisco Mission-style burrito?',
  });

  for await (const part of result.textStream) {
    process.stdout.write(part);
  }

  console.log();
  console.log('Token usage:', await result.usage);
  console.log('Finish reason:', await result.finishReason);
}

main().catch(error => {
  console.error('Gateway script failed:', error);
  process.exitCode = 1;
});
