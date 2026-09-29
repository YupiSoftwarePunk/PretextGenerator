'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { FloatingObstacles } from '@/components/FloatingObstacles';
import { Header } from '@/components/layout/Header';
import { HeroMagneticText } from '@/components/showcase/HeroMagneticText';
import { PlaygroundArena } from '@/components/showcase/PlaygroundArena';
import { CyberEditorialSpread } from '@/components/showcase/CyberEditorialSpread';
import { PerformanceBattle } from '@/components/showcase/PerformanceBattle';
import { InteractiveFormatsSection } from '@/components/showcase/InteractiveFormatsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 relative overflow-x-hidden font-sans scroll-smooth">
      {/* Universal Sticky Header */}
      <Header showAnchorLinks={true} />

      {/* Background Radial Lights */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      {/* Cyber Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Animated Orbs */}
      <FloatingObstacles />

      <div className="relative z-10 flex flex-col min-h-screen pt-16">
        {/* Main Showcase Modules */}
        <main className="flex-1 w-full space-y-8 sm:space-y-12 md:space-y-16">
          {/* Module 1: Interactive Hero with Magnetic Forcefield */}
          <div id="hero">
            <HeroMagneticText />
          </div>

          {/* Module 2: Playground Arena (Interactive Sandbox) */}
          <div id="sandbox">
            <PlaygroundArena />
          </div>

          {/* Module 3: Cyber-Editorial Magazine Spread */}
          <div id="magazine">
            <CyberEditorialSpread />
          </div>

          {/* Module 4: Performance Battle Benchmark */}
          <div id="benchmark">
            <PerformanceBattle />
          </div>

          {/* Module 5: Interactive Formats (Slide Player, 3D Flip Card, Live Cheatsheet) */}
          <div id="formats">
            <InteractiveFormatsSection />
          </div>
        </main>

        {/* Footer with GitHub Link & Glow */}
        <footer className="w-full py-6 sm:py-8 px-4 sm:px-6 border-t border-white/10 relative z-10 bg-zinc-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/YupiSoftwarePunk/PretextGenerator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/60 hover:text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 text-zinc-300 min-h-[44px]"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
