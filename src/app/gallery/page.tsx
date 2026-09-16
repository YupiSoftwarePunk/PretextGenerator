'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, FileText, ScrollText, Sparkles, Play } from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { templates, getTemplatesByType } from '@/lib/templates';
import { generateId } from '@/lib/storage';

type FilterType = 'all' | DocumentType;

const filterOptions: { value: FilterType; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'all', label: 'Все шаблоны', icon: Sparkles },
  { value: 'slide', label: 'Слайды', icon: LayoutGrid },
  { value: 'card', label: 'Карточки', icon: FileText },
  { value: 'cheatsheet', label: 'Шпаргалки', icon: ScrollText },
];

export default function GalleryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTemplates = activeFilter === 'all'
    ? templates
    : getTemplatesByType(activeFilter);

  const handleUseTemplate = (template: Template) => {
    const docId = generateId();
    const newDoc = {
      id: docId,
      type: template.type,
      title: template.name,
      content: template.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: template.id,
    };

    localStorage.setItem('pretext_current_draft', JSON.stringify(newDoc));
    router.push(`/editor?id=${docId}&type=${template.type}`);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#09090B] relative overflow-hidden">
      {/* Радиальное свечение */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      {/* Тонкая сетка */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Floating orbs */}
      <div className="absolute top-20 right-[15%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-[float-gentle_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 left-[15%] w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-[float-gentle_12s_ease-in-out_infinite]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-6 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-white/5 border border-white/10 backdrop-blur-sm
                  hover:bg-white/10 hover:border-violet-500/50
                  transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                <span className="text-sm text-zinc-300">Главная</span>
              </button>

              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Галерея шаблонов
                </h1>
                <p className="text-zinc-400 text-sm">Выберите шаблон для быстрого старта</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-12">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeFilter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg
                    border backdrop-blur-sm
                    transition-all duration-300
                    ${isActive
                      ? 'bg-violet-500/20 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-zinc-400'} transition-colors`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {option.label}
                  </span>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-violet-500/30 text-violet-200' : 'bg-white/10 text-zinc-400'}
                  `}>
                    {option.value === 'all' ? templates.length : getTemplatesByType(option.value).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Templates grid */}
          {filteredTemplates.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Шаблоны не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="group glass-card glass-card-hover rounded-2xl p-6
                    hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Preview thumbnail placeholder */}
                  <div className="relative w-full aspect-video rounded-lg mb-4 overflow-hidden
                    bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {template.type === 'slide' && <LayoutGrid className="w-12 h-12 text-zinc-700" />}
                      {template.type === 'card' && <FileText className="w-12 h-12 text-zinc-700" />}
                      {template.type === 'cheatsheet' && <ScrollText className="w-12 h-12 text-zinc-700" />}
                    </div>

                    {/* Preview overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                      transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Play className="w-8 h-8 text-white mx-auto" />
                        <p className="text-sm text-zinc-300">Предпросмотр</p>
                      </div>
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                    bg-white/5 border border-white/10 mb-3">
                    {template.type === 'slide' && <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />}
                    {template.type === 'card' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                    {template.type === 'cheatsheet' && <ScrollText className="w-3.5 h-3.5 text-pink-400" />}
                    <span className="text-xs text-zinc-400 font-medium">
                      {template.type === 'slide' && 'Слайд'}
                      {template.type === 'card' && 'Карточка'}
                      {template.type === 'cheatsheet' && 'Шпаргалка'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:gradient-text-static transition-colors">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full px-4 py-2.5 rounded-lg
                      bg-gradient-to-r from-violet-500/20 to-cyan-500/20
                      border border-violet-500/30
                      hover:from-violet-500/30 hover:to-cyan-500/30
                      hover:border-violet-500/50
                      transition-all duration-300
                      hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]
                      text-sm font-medium text-white
                      group-hover:scale-105"
                  >
                    Использовать шаблон
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full py-8 px-6 backdrop-blur-md border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-zinc-500">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'шаблон' : 'шаблонов'} доступно
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
