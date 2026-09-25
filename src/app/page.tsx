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
    <div className="min-h-screen bg-[#09090B] text-zinc-100 relative overflow-hidden font-sans scroll-smooth">
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
        <main className="flex-1 w-full space-y-12">
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

          {/* Module 6: Architecture Spec Card */}
          <section className="w-full max-w-5xl mx-auto px-6 pb-24">
            <div className="glass-card rounded-3xl p-8 sm:p-12 border border-violet-500/30 bg-zinc-950/80 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Архитектура Pretext Engine
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                    Pretext разработан для полного устранения узких мест рендеринга типографики в вебе. Все вычисления производятся в памяти на основе быстрого кэша метрик Canvas 2D API, позволяя плавно огибать сложные геометрические тела на скорости до 120 FPS.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-violet-400 block font-bold mb-1">0 DOM Reflows</span>
                      <span className="text-zinc-400">Исключает пересчеты стилей</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-cyan-400 block font-bold mb-1">~0.15 ms Frame</span>
                      <span className="text-zinc-400">Субмиллисекундный расчет</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-emerald-400 block font-bold mb-1">Static GH Pages</span>
                      <span className="text-zinc-400">100% клиентский экспорт</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer with GitHub Link & Pink Glow */}
        <footer className="w-full py-8 px-6 border-t border-white/10 relative z-10 bg-zinc-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-400 font-mono">

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/YupiSoftwarePunk/PretextGenerator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/60 hover:text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 text-zinc-300"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
