'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Plus, Trash2, Edit3, LayoutGrid, FileText, ScrollText } from 'lucide-react';
import { Document, DocumentType } from '@/types';
import { templates } from '@/lib/templates';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import { useIsMounted } from '@/hooks/useIsMounted';

const emptyDocs: Document[] = [];

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStoredDocs(): Document[] {
  if (typeof window === 'undefined') return emptyDocs;
  try {
    const raw = localStorage.getItem('pretext_docs');
    return raw ? JSON.parse(raw) : emptyDocs;
  } catch {
    return emptyDocs;
  }
}

export default function GalleryPage() {
  const isMounted = useIsMounted();
  const savedDocs = useSyncExternalStore(subscribeStorage, getStoredDocs, () => emptyDocs);

  const handleDelete = (id: string) => {
    const updated = savedDocs.filter((d) => d.id !== id);
    try {
      localStorage.setItem('pretext_docs', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to delete doc', e);
    }
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

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Главная</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Галерея документов
          </h1>
        </div>

        <Link
          href="/editor"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-xs shadow-lg shadow-violet-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новый документ</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Saved User Documents */}
        {isMounted && savedDocs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Мои сохраненные документы ({savedDocs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDocs.map((doc) => {
                const Icon = getIcon(doc.type);
                return (
                  <div
                    key={doc.id}
                    className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-violet-500/40 transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-violet-400 bg-violet-950/60 px-2.5 py-1 rounded-md border border-violet-500/20">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="uppercase">{doc.type}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{doc.title}</h3>
                      <div className="text-xs text-zinc-400 max-h-24 overflow-hidden text-ellipsis line-clamp-3">
                        {doc.content}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/editor?type=${doc.type}`}
                        className="flex items-center gap-1 text-xs font-medium text-violet-400 group-hover:text-violet-300"
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

        {/* Built-in Templates Showcase */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            Витрина готовых пресетов ({templates.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const Icon = getIcon(tpl.type);
              return (
                <div
                  key={tpl.id}
                  className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-violet-500/40 transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] group"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 w-fit mb-4">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="uppercase">{tpl.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{tpl.name}</h3>
                    <p className="text-xs text-zinc-400 mb-4">{tpl.description}</p>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-white/5 max-h-32 overflow-hidden text-xs text-zinc-300 font-mono line-clamp-4">
                      <PretextRenderer content={tpl.content} />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end">
                    <Link
                      href={`/editor?type=${tpl.type}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-600 hover:text-white border border-white/10 text-xs font-medium text-zinc-300 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Использовать пресет</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
