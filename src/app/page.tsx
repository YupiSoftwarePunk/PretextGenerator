'use client';

import { useRouter } from 'next/navigation';
import { FileText, LayoutGrid, ScrollText, Sparkles, ArrowRight } from 'lucide-react';
import { DocumentType } from '@/types';

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
    title: 'Слайды',
    description: 'Презентационные слайды с анимациями и переходами',
    icon: LayoutGrid,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    type: 'card',
    title: 'Карточки',
    description: 'Визуальные карточки и флэшкарды для быстрого обучения',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    type: 'cheatsheet',
    title: 'Шпаргалки',
    description: 'Структурированные справочники и гайды',
    icon: ScrollText,
    gradient: 'from-pink-500 to-rose-500',
  },
];

export default function Home() {
  const router = useRouter();

  const handleCreateDocument = (type: DocumentType) => {
    router.push(`/editor?type=${type}`);
  };

  const handleViewGallery = () => {
    router.push('/gallery');
  };

  return (
    <div className="min-h-screen bg-[#09090B] relative overflow-hidden">
      {/* Радиальное свечение сверху */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      {/* Тонкая сетка на заднем плане */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-[float-gentle_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-[float-gentle_10s_ease-in-out_infinite]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-6 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold gradient-text mb-1">
                Pretext Generator
              </h1>
              <p className="text-zinc-400 text-sm">Создавайте визуальный контент</p>
            </div>
            <button
              onClick={handleViewGallery}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-lg
                bg-white/5 border border-white/10 backdrop-blur-sm
                hover:bg-white/10 hover:border-violet-500/50
                transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]"
            >
              <Sparkles className="w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="text-sm font-medium text-zinc-200">Галерея</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-20">
          {/* Hero section */}
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-6xl font-bold leading-tight">
              <span className="gradient-text">
                Создавайте контент
              </span>
              <br />
              <span className="text-white">быстро и красиво</span>
            </h2>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Выберите формат и начните создавать слайды, карточки или шпаргалки
              с минималистичной разметкой Pretext
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {documentTypes.map((docType, index) => {
              const Icon = docType.icon;

              return (
                <button
                  key={docType.type}
                  onClick={() => handleCreateDocument(docType.type)}
                  className="group glass-card glass-card-hover text-left p-8 rounded-2xl
                    hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Icon with gradient */}
                  <div className={`inline-flex p-4 rounded-xl mb-6
                    bg-gradient-to-br ${docType.gradient} bg-opacity-10
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white icon-glow" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:gradient-text-static transition-colors">
                    {docType.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 leading-relaxed mb-4">
                    {docType.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-violet-400
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Создать</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info card */}
          <div className="glass-card rounded-2xl p-10 max-w-4xl mx-auto
            hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] transition-all duration-500">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500
                flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold gradient-text-static">
                  Что такое Pretext?
                </h3>

                <div className="space-y-3 text-zinc-300 leading-relaxed">
                  <p>
                    Минималистичная разметка для создания структурированного контента.
                    Простой синтаксис позволяет быстро создавать слайды, карточки и шпаргалки.
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      <span>Простая разметка без лишней сложности</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                      <span>Экспорт в HTML, PNG, PDF</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                      <span>Автосохранение в браузере</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-8 px-6 backdrop-blur-md border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-zinc-500">
              Создано для GitHub Pages • Next.js + Pretext
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
