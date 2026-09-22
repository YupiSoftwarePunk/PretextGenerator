'use client';

import Link from 'next/link';
import { Sparkles, Zap } from 'lucide-react';
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

        {/* Footer */}
        <footer className="w-full py-10 px-6 backdrop-blur-xl border-t border-white/10 bg-zinc-950/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Pretext Technology Showcase</span>
            </div>

            <p className="text-xs text-zinc-500 text-center">
              Развернуто на GitHub Pages • Next.js 16 Static Export • Canvas Hardware Acceleration
            </p>

            <div className="flex items-center gap-4 text-zinc-400 text-xs font-mono">
              <Link href="/editor" className="hover:text-white transition-colors">
                Студия
              </Link>
              <Link href="/gallery" className="hover:text-white transition-colors">
                Галерея
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
