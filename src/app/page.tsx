import Image from "next/image";
import { VoiceConnection } from "@/components/VoiceConnection";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col gap-8 items-center">
        {/* Limi AI Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/png/__Primary_Logo_Colored.png"
            alt="Limi AI Logo"
            width={200}
            height={80}
            priority
            className="object-contain"
          />
          <p className="text-muted-foreground text-lg text-center">Real-time voice AI assistant</p>
        </div>

        {/* Voice Connection Component */}
        <VoiceConnection />

      </main>
    </div>
  );
}
