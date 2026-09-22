'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  LayoutGrid,
  ScrollText,
  Sparkles,
  ArrowRight,
  Code,
  Zap,
} from 'lucide-react';
import { DocumentType } from '@/types';
import { FloatingObstacles } from '@/components/FloatingObstacles';
import { HeroMagneticText } from '@/components/showcase/HeroMagneticText';
import { PlaygroundArena } from '@/components/showcase/PlaygroundArena';
import { CyberEditorialSpread } from '@/components/showcase/CyberEditorialSpread';
import { PerformanceBattle } from '@/components/showcase/PerformanceBattle';

interface DocumentTypeCard {
  type: DocumentType;
  title: string;
  description: string;
  icon: typeof FileText;
  gradient: string;
}

const documentTypes: DocumentTypeCard[] = [
  {
    type: 'slide',
    title: 'Презентации и Слайды',
    description: 'Интерактивные слайды с кинетической типографикой и переходами',
    icon: LayoutGrid,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    type: 'card',
    title: 'Обучающие Карточки',
    description: 'Визуальные карточки и флэшкарды с идеальным обтеканием медиа',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    type: 'cheatsheet',
    title: 'Интерактивные Шпаргалки',
    description: 'Многоколоночные структурированные справочники и гайды',
    icon: ScrollText,
    gradient: 'from-pink-500 to-rose-600',
  },
];

export default function Home() {
  const router = useRouter();

  const handleCreateDocument = (type: DocumentType) => {
    router.push(`/editor?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 relative overflow-hidden font-sans scroll-smooth">
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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <header className="w-full py-4 px-6 backdrop-blur-xl bg-zinc-950/70 border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold gradient-text leading-none">
                  Pretext Core
                </h1>
                <span className="text-[10px] font-mono text-zinc-400">120 FPS Typography</span>
              </div>
            </Link>

            {/* In-page Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-zinc-400">
              <a href="#sandbox" className="hover:text-cyan-300 transition-colors">
                Песочница
              </a>
              <a href="#magazine" className="hover:text-violet-300 transition-colors">
                Журнал
              </a>
              <a href="#benchmark" className="hover:text-emerald-300 transition-colors">
                Бенчмарк
              </a>
              <a href="#formats" className="hover:text-pink-300 transition-colors">
                Форматы
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/gallery"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
              >
                Галерея
              </Link>
              <Link
                href="/editor"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Pretext Studio</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Showcase Modules */}
        <main className="flex-1 w-full space-y-12">
          {/* Module 1: Interactive Hero with Magnetic Forcefield */}
          <HeroMagneticText />

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

          {/* Module 5: Document Formats Grid */}
          <section id="formats" className="w-full max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DOCUMENT GENERATOR</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
                Создавайте в любом формате
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-base">
                Выберите подходящий формат для презентаций, карточек или шпаргалок и экспортируйте в высоком качестве.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {documentTypes.map((docType, index) => {
                const Icon = docType.icon;

                return (
                  <button
                    key={docType.type}
                    onClick={() => handleCreateDocument(docType.type)}
                    className="group glass-card glass-card-hover text-left p-8 rounded-3xl border border-white/10 hover:border-violet-500/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all flex flex-col justify-between"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div>
                      {/* Icon */}
                      <div
                        className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${docType.gradient} shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                        {docType.title}
                      </h3>

                      {/* Description */}
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        {docType.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-violet-400 group-hover:translate-x-1 transition-transform">
                      <span>Создать документ</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

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
