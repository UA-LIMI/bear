import Image from "next/image";
import Link from "next/link";
import { VoiceConnection } from "@/components/VoiceConnection";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col gap-8 items-center">
        {/* Limi AI Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/PNG/__Primary_Logo_Colored.png"
            alt="Limi AI Logo"
            width={200}
            height={80}
            priority
            className="object-contain"
          />
          <p className="text-muted-foreground text-lg text-center">The Peninsula Hong Kong - Smart Hotel Experience</p>
        </div>

        {/* Quick Access Buttons */}
        <div className="flex gap-4 mb-4">
          <Link 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            🏨 Hotel Dashboard
          </Link>
          <Link 
            href="/guest"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            👤 Guest Interface
          </Link>
        </div>

        {/* Voice Connection Component */}
        <VoiceConnection />

      </main>
    </div>
  );
}
