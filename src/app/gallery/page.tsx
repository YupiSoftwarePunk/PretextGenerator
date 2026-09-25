'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  LayoutGrid,
  FileText,
  ScrollText,
  Search,
  Eye,
  X,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { Document, DocumentType, Template } from '@/types';
import { templates } from '@/lib/templates';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Header } from '@/components/layout/Header';

const emptyDocs: Document[] = [];

let cachedRaw: string | null = null;
let cachedDocs: Document[] = emptyDocs;

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('focus', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('focus', callback);
  };
}

function getStoredDocs(): Document[] {
  if (typeof window === 'undefined') return emptyDocs;
  try {
    const raw = localStorage.getItem('pretext_docs');
    if (raw === null) {
      if (cachedRaw !== null) {
        cachedRaw = null;
        cachedDocs = emptyDocs;
      }
      return cachedDocs;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedDocs = JSON.parse(raw);
    }
    return cachedDocs;
  } catch {
    return emptyDocs;
  }
}

export default function GalleryPage() {
  const isMounted = useIsMounted();
  const savedDocs = useSyncExternalStore(subscribeStorage, getStoredDocs, () => emptyDocs);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | DocumentType>('all');

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    type: DocumentType;
    title: string;
    content: string;
    isPreset?: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleOpenInStudio = (type: DocumentType, content: string, title: string) => {
    try {
      localStorage.setItem('pretext_active_doc', JSON.stringify({ type, content, title }));
    } catch (e) {
      console.error('Failed to save active doc', e);
    }
  };

  const handleDelete = (id: string) => {
    const updated = savedDocs.filter((d) => d.id !== id);
    try {
      localStorage.setItem('pretext_docs', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      if (previewDoc?.id === id) setPreviewDoc(null);
    } catch (e) {
      console.error('Failed to delete doc', e);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = (type: DocumentType) => {
    switch (type) {
      case 'slide':
        return LayoutGrid;
      case 'card':
        return FileText;
      case 'cheatsheet':
        return ScrollText;
    }
  };

  const getTypeBadgeStyle = (type: DocumentType) => {
    switch (type) {
      case 'slide':
        return 'text-violet-400 bg-violet-950/60 border-violet-500/20';
      case 'card':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/20';
      case 'cheatsheet':
        return 'text-pink-400 bg-pink-950/60 border-pink-500/20';
    }
  };

  const getTypeCardHoverStyle = (type: DocumentType) => {
    switch (type) {
      case 'slide':
        return 'hover:border-violet-500/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]';
      case 'card':
        return 'hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]';
      case 'cheatsheet':
        return 'hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]';
    }
  };

  const getTypeButtonHoverStyle = (type: DocumentType) => {
    switch (type) {
      case 'slide':
        return 'hover:bg-violet-600 hover:text-white';
      case 'card':
        return 'hover:bg-cyan-600 hover:text-white';
      case 'cheatsheet':
        return 'hover:bg-pink-600 hover:text-white';
    }
  };

  // Filtered lists
  const filteredSavedDocs = useMemo(() => {
    return savedDocs.filter((doc) => {
      const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [savedDocs, activeFilter, searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesFilter = activeFilter === 'all' || tpl.type === activeFilter;
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Container with Top Padding for Sticky Header */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-24 pb-16 space-y-10">
        {/* Gallery Hero & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRETEXT SHOWCASE GALLERY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Галерея документов</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Просматривайте шаблоны, созданные презентации, карточки и справочники.
            </p>
          </div>

          <Link
            href="/editor"
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Создать в студии</span>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-white/10">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или тексту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1 hidden sm:inline" />
            {[
              { id: 'all', label: 'Все' },
              { id: 'slide', label: 'Слайды' },
              { id: 'card', label: 'Карточки' },
              { id: 'cheatsheet', label: 'Шпаргалки' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all whitespace-nowrap border ${
                  activeFilter === f.id
                    ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Saved User Documents Section */}
        {isMounted && filteredSavedDocs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Мои сохраненные документы ({filteredSavedDocs.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSavedDocs.map((doc) => {
                const Icon = getIcon(doc.type);
                return (
                  <div
                    key={doc.id}
                    className={`glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between transition-all group h-[280px] ${getTypeCardHoverStyle(doc.type)}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border ${getTypeBadgeStyle(doc.type)}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="uppercase">{doc.type}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/30 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 truncate">{doc.title}</h3>
                      <div className="text-xs text-zinc-400 line-clamp-4 font-mono leading-relaxed bg-zinc-950/50 p-2.5 rounded-xl border border-white/5">
                        {doc.content}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() =>
                          setPreviewDoc({
                            id: doc.id,
                            type: doc.type,
                            title: doc.title,
                            content: doc.content,
                            isPreset: false,
                          })
                        }
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Предпросмотр</span>
                      </button>

                      <Link
                        href={`/editor?type=${doc.type}`}
                        onClick={() => handleOpenInStudio(doc.type, doc.content, doc.title)}
                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                          doc.type === 'slide' ? 'text-violet-400 group-hover:text-violet-300' : doc.type === 'card' ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-pink-400 group-hover:text-pink-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Открыть</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. Presets Showcase Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <span>Готовые пресеты Pretext ({filteredTemplates.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl: Template) => {
              const Icon = getIcon(tpl.type);
              return (
                <div
                  key={tpl.id}
                  className={`glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between transition-all group h-[300px] ${getTypeCardHoverStyle(tpl.type)}`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border ${getTypeBadgeStyle(tpl.type)}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="uppercase">{tpl.type}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">Preset</span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1 truncate">{tpl.name}</h3>
                    <p className="text-xs text-zinc-400 mb-3 truncate">{tpl.description}</p>

                    <div className="bg-zinc-950/70 rounded-xl p-3 border border-white/5 h-[90px] overflow-hidden text-xs text-zinc-300 font-mono">
                      <PretextRenderer content={tpl.content} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          id: tpl.id,
                          type: tpl.type,
                          title: tpl.name,
                          content: tpl.content,
                          isPreset: true,
                        })
                      }
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Предпросмотр</span>
                    </button>

                    <Link
                      href={`/editor?type=${tpl.type}`}
                      onClick={() => handleOpenInStudio(tpl.type, tpl.content, tpl.name)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 transition-all ${getTypeButtonHoverStyle(tpl.type)}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>В студию</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FULLSCREEN PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/20 w-full max-w-3xl max-h-[90vh] flex flex-col justify-between shadow-[0_0_60px_rgba(139,92,246,0.3)] bg-zinc-950/95 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-violet-400 bg-violet-950/80 px-3 py-1 rounded-lg border border-violet-500/30 uppercase font-bold">
                  {previewDoc.type}
                </span>
                <h3 className="text-lg font-bold text-white truncate max-w-md">{previewDoc.title}</h3>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Rendered View */}
            <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10">
                <PretextRenderer content={previewDoc.content} />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(previewDoc.content)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Копировать разметку'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                >
                  Закрыть
                </button>
                <Link
                  href={`/editor?type=${previewDoc.type}`}
                  onClick={() => handleOpenInStudio(previewDoc.type, previewDoc.content, previewDoc.title)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать в студии</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
