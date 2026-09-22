'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Code,
  Layers,
  Save,
  Trash2,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { DocumentType, Template } from '@/types';
import { getTemplatesByType } from '@/lib/templates';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import PretextFlowRenderer from '@/components/pretext/PretextFlowRenderer';
import { Obstacle } from '@/lib/PretextEngine';

function EditorContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as DocumentType) || 'slide';

  const [docType, setDocType] = useState<DocumentType>(initialType);
  const [content, setContent] = useState<string>(() => {
    const available = getTemplatesByType(initialType);
    return available.length > 0 ? available[0].content : '';
  });
  const [activeTab, setActiveTab] = useState<'editor' | 'flow' | 'raw'>('flow');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { x: 260, y: 40, width: 140, height: 140, shape: 'circle' },
  ]);

  const handleTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    const available = getTemplatesByType(newType);
    if (available.length > 0) {
      setContent(available[0].content);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setContent(template.content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLocalStorage = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('pretext_docs') || '[]');
      const newDoc = {
        id: 'doc_' + Date.now(),
        type: docType,
        title: `${docType.toUpperCase()} - ${new Date().toLocaleDateString()}`,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('pretext_docs', JSON.stringify([newDoc, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save', e);
    }
  };

  const handleAddObstacle = (shape: 'rect' | 'circle') => {
    const newObs: Obstacle = {
      x: Math.floor(Math.random() * 200) + 100,
      y: Math.floor(Math.random() * 150) + 50,
      width: shape === 'circle' ? 120 : 160,
      height: shape === 'circle' ? 120 : 100,
      shape,
    };
    setObstacles((prev) => [...prev, newObs]);
  };

  const handleClearObstacles = () => {
    setObstacles([]);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Pretext Studio
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
          <button
            onClick={handleSaveToLocalStorage}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Сохранено!' : 'Сохранить'}</span>
          </button>
          <Link
            href="/gallery"
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
          >
            Галерея
          </Link>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Controls & Templates */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950/50 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Document Type Selector */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block">
              Тип документа
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slide', 'card', 'cheatsheet'] as DocumentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all border ${
                    docType === t
                      ? 'bg-violet-600/30 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {t === 'slide' ? 'Слайд' : t === 'card' ? 'Карточка' : 'Шпаргалка'}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Templates */}
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block">
              Готовые шаблоны
            </label>
            <div className="space-y-2">
              {getTemplatesByType(docType).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/40 hover:bg-white/10 transition-all group"
                >
                  <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">
                    {tpl.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{tpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Obstacle Controls for Dynamic Flow */}
          <div className="pt-4 border-t border-white/10">
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 block flex items-center justify-between">
              <span>Препятствия потока</span>
              <span className="text-[10px] text-violet-400 font-mono">{obstacles.length} шт.</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddObstacle('circle')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Круг</span>
              </button>
              <button
                onClick={() => handleAddObstacle('rect')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>+ Блок</span>
              </button>
            </div>
            {obstacles.length > 0 && (
              <button
                onClick={handleClearObstacles}
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Сбросить фигуры</span>
              </button>
            )}
          </div>
        </aside>

        {/* Center: Split Editor & Preview */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-y-auto">
          {/* Text Editor Area */}
          <div className="flex flex-col h-full bg-[#0d0d12]">
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/40">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-violet-400" />
                Разметка Pretext
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {content.length} симв. | {content.split(/\s+/).filter(Boolean).length} слов
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Заголовок\n\nТекст для динамического обтекания..."
              className="flex-1 w-full p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[350px]"
              spellCheck={false}
            />
          </div>

          {/* Live Preview Area */}
          <div className="flex flex-col h-full bg-zinc-950/60 p-6 overflow-y-auto">
            {/* View Mode Tabs */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setActiveTab('flow')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'flow'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pretext Flow</span>
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'editor'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Formatted Card</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                ⚡ 60 FPS Engine
              </span>
            </div>

            {/* Renderer View */}
            <div className="flex-1 flex items-center justify-center min-h-[380px]">
              {activeTab === 'flow' ? (
                <div className="w-full relative border border-white/10 rounded-2xl p-6 bg-zinc-900/40 backdrop-blur-md shadow-2xl min-h-[360px]">
                  {/* Render simulated obstacles in preview */}
                  {obstacles.map((obs, idx) => (
                    <div
                      key={idx}
                      className="absolute border border-cyan-400/50 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center pointer-events-none"
                      style={{
                        left: `${obs.x}px`,
                        top: `${obs.y}px`,
                        width: `${obs.width}px`,
                        height: `${obs.height}px`,
                        borderRadius: obs.shape === 'circle' ? '50%' : '12px',
                      }}
                    >
                      <span className="text-[10px] font-mono text-cyan-200">
                        {obs.shape === 'circle' ? '● Obstacle' : '■ Obstacle'}
                      </span>
                    </div>
                  ))}

                  <PretextFlowRenderer
                    content={content}
                    obstacles={obstacles}
                    containerWidth={540}
                    fontSize={15}
                    lineHeight={24}
                  />
                </div>
              ) : (
                <div className="w-full glass-card rounded-2xl p-8 border border-white/10 max-w-lg shadow-2xl">
                  <PretextRenderer content={content} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] text-zinc-400 flex items-center justify-center">Загрузка Pretext Studio...</div>}>
      <EditorContent />
    </Suspense>
  );
}
