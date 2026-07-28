'use client';

import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      
      {/* Logo & Branding */}
      <div className="w-24 h-24 bg-brand-purple/20 rounded-full flex items-center justify-center mb-6 border border-brand-purple/30">
        <Dumbbell size={48} className="text-brand-purple" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
        FitAI Pro
      </h1>
      
      <p className="text-sm text-zinc-400 mb-12 text-center max-w-[250px]">
        Your personal AI-powered fitness coach and tracker.
      </p>

      {/* Routing Buttons */}
      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => router.push('/signup')}
          className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold text-[15px] rounded-2xl transition-transform active:scale-95 shadow-lg shadow-brand-purple/20"
        >
          Create Account
        </button>
        
        <button
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-zinc-900 text-white font-extrabold text-[15px] rounded-2xl border border-zinc-800 transition-transform active:scale-95"
        >
          Log In
        </button>
      </div>

    </div>
  );
}