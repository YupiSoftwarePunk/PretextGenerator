'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, FileText, ScrollText, Sparkles, Eye, Download, Edit } from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { templates } from '@/lib/templates';
import { generateId } from '@/lib/storage';
import { exportContent } from '@/lib/export';
import PreviewModal from '@/components/modals/PreviewModal';
import ExportModal, { ExportOptions } from '@/components/modals/ExportModal';
import PretextRenderer from '@/components/pretext/PretextRenderer';

type FilterType = 'all' | DocumentType;

const filterOptions: { value: FilterType; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'all', label: 'Все шаблоны', icon: Sparkles },
  { value: 'slide', label: 'Слайды', icon: LayoutGrid },
  { value: 'card', label: 'Карточки', icon: FileText },
  { value: 'cheatsheet', label: 'Шпаргалки', icon: ScrollText },
];

interface PresetState {
  [key: string]: {
    title: string;
    content: string;
  };
}

export default function GalleryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [presetStates, setPresetStates] = useState<PresetState>({});
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [exportTemplate, setExportTemplate] = useState<Template | null>(null);

  const filteredTemplates = activeFilter === 'all'
    ? templates
    : templates.filter(t => t.type === activeFilter);

  const getPresetState = (templateId: string) => {
    return presetStates[templateId] || {
      title: templates.find(t => t.id === templateId)?.name || '',
      content: templates.find(t => t.id === templateId)?.content || '',
    };
  };

  const updatePresetState = (templateId: string, updates: Partial<{ title: string; content: string }>) => {
    setPresetStates(prev => ({
      ...prev,
      [templateId]: {
        ...getPresetState(templateId),
        ...updates,
      },
    }));
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleExport = (template: Template) => {
    setExportTemplate(template);
  };

  const handleExportConfirm = async (options: ExportOptions) => {
    if (!exportTemplate) return;

    const state = getPresetState(exportTemplate.id);
    const filename = `pretext-${exportTemplate.type}-${Date.now()}`;

    try {
      // Передаем content напрямую, не DOM элемент
      await exportContent(state.content, filename, options);
      console.log(`✅ Файл ${filename}.${options.format} успешно сохранен`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Ошибка экспорта: ${error}`);
    }
  };

  const handleOpenInEditor = (template: Template) => {
    const state = getPresetState(template.id);
    const docId = generateId();
    const newDoc = {
      id: docId,
      type: template.type,
      title: state.title,
      content: state.content,
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
      {/* Background effects */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />
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
                  Интерактивные пресеты
                </h1>
                <p className="text-zinc-400 text-sm">Настройте и экспортируйте контент</p>
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
              const count = option.value === 'all' ? templates.length : templates.filter(t => t.type === option.value).length;

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
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Templates grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const state = getPresetState(template.id);
              const isExpanded = expandedPreset === template.id;

              return (
                <div
                  key={template.id}
                  className="glass-card rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300"
                >
                  {/* Header with type badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                        bg-white/5 border border-white/10 mb-2">
                        {template.type === 'slide' && <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />}
                        {template.type === 'card' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                        {template.type === 'cheatsheet' && <ScrollText className="w-3.5 h-3.5 text-pink-400" />}
                        <span className="text-xs text-zinc-400 font-medium capitalize">
                          {template.type === 'slide' && 'Слайд'}
                          {template.type === 'card' && 'Карточка'}
                          {template.type === 'cheatsheet' && 'Шпаргалка'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {template.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedPreset(isExpanded ? null : template.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                        hover:border-violet-500/30 transition-all"
                      title={isExpanded ? 'Свернуть' : 'Редактировать'}
                    >
                      <Edit className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>

                  {/* Inline editor (collapsible) */}
                  {isExpanded && (
                    <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          Заголовок
                        </label>
                        <input
                          type="text"
                          value={state.title}
                          onChange={(e) => updatePresetState(template.id, { title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                            text-white placeholder-zinc-500
                            focus:outline-none focus:ring-2 focus:ring-violet-500/50
                            transition-all"
                          placeholder="Введите заголовок..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          Контент (Pretext)
                        </label>
                        <textarea
                          value={state.content}
                          onChange={(e) => updatePresetState(template.id, { content: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                            text-zinc-300 placeholder-zinc-500 font-mono text-sm
                            focus:outline-none focus:ring-2 focus:ring-violet-500/50
                            transition-all resize-none"
                          placeholder="Введите Pretext разметку..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview area */}
                  <div className="relative rounded-lg bg-zinc-900/50 border border-white/5 p-4 mb-4
                    min-h-[200px] max-h-[300px] overflow-y-auto">
                    <PretextRenderer content={state.content} />
                  </div>

                  {/* Action buttons - 2 columns: Preview + Export */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePreview(template)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                        bg-white/5 border border-white/10 backdrop-blur-sm
                        hover:bg-white/10 hover:border-cyan-500/50
                        transition-all duration-300 text-sm font-medium text-zinc-300
                        hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    >
                      <Eye className="w-4 h-4" />
                      Предпросмотр
                    </button>

                    <button
                      onClick={() => handleExport(template)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                        bg-gradient-to-r from-violet-500/20 to-cyan-500/20
                        border border-violet-500/30 backdrop-blur-sm
                        hover:from-violet-500/30 hover:to-cyan-500/30
                        hover:border-violet-500/50
                        transition-all duration-300
                        hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]
                        text-sm font-semibold text-white"
                    >
                      <Download className="w-4 h-4" />
                      Экспорт
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Modals */}
      {previewTemplate && (
        <PreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onExport={() => {
            setExportTemplate(previewTemplate);
            setPreviewTemplate(null);
          }}
          title={previewTemplate?.name}
        >
          <div className="max-w-4xl mx-auto bg-zinc-900 rounded-2xl p-12 border border-white/10">
            <PretextRenderer
              content={previewTemplate ? getPresetState(previewTemplate.id).content : ''}
            />
          </div>
        </PreviewModal>
      )}

      {exportTemplate && (
        <ExportModal
          isOpen={!!exportTemplate}
          onClose={() => setExportTemplate(null)}
          onExport={handleExportConfirm}
          title={`Экспорт: ${exportTemplate.name}`}
        />
      )}
    </div>
  );
}
