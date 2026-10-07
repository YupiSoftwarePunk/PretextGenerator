'use client';

import React, { useRef, useState, useMemo } from 'react';
import {
  Code,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  FileCode,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Columns,
  Eye,
  Plus,
  Table,
  Link as LinkIcon,
  ChevronRight,
  ListTree,
} from 'lucide-react';
import { DocumentType } from '@/types';
import { renderHighlightedLines } from './syntaxHighlight';

interface TextEditorPaneProps {
  content: string;
  onChange: (newContent: string) => void;
  mobileVisible: boolean;
  docType?: DocumentType;
  activeSlideIndex?: number;
  slidesCount?: number;
  onSlideChange?: (index: number) => void;
  onAddSlide?: () => void;
  cardSide?: 'front' | 'back';
  onToggleCardSide?: () => void;
}

export const TextEditorPane: React.FC<TextEditorPaneProps> = ({
  content,
  onChange,
  mobileVisible,
  docType = 'slide',
  activeSlideIndex = 0,
  slidesCount = 1,
  onSlideChange,
  onAddSlide,
  cardSide = 'front',
  onToggleCardSide,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'highlight' | 'split'>('editor');
  const [showOutline, setShowOutline] = useState(false);

  const wordCount = useMemo(() => {
    return content.split(/\s+/).filter(Boolean).length;
  }, [content]);

  // Extract document outline (slides or headers)
  const outlineItems = useMemo(() => {
    const lines = content.split('\n');
    const items: { lineIndex: number; title: string; level: number; type: 'slide' | 'header' | 'card' }[] = [];

    if (docType === 'slide') {
      const slideChunks = content.split(/\n---\s*\n/);
      slideChunks.forEach((chunk, idx) => {
        const firstLine = chunk.trim().split('\n')[0] || `Слайд ${idx + 1}`;
        const cleanTitle = firstLine.replace(/^#+\s*/, '') || `Слайд ${idx + 1}`;
        items.push({
          lineIndex: idx,
          title: cleanTitle.substring(0, 32),
          level: 1,
          type: 'slide',
        });
      });
      return items;
    }

    if (docType === 'card') {
      items.push({ lineIndex: 0, title: 'Лицевая сторона (Front)', level: 1, type: 'card' });
      if (content.includes('=== BACK ===')) {
        items.push({ lineIndex: 1, title: 'Обратная сторона (Back)', level: 1, type: 'card' });
      }
      return items;
    }

    // Default: extract markdown headings #, ##, ###
    lines.forEach((line, idx) => {
      if (line.startsWith('# ')) {
        items.push({ lineIndex: idx, title: line.replace('# ', ''), level: 1, type: 'header' });
      } else if (line.startsWith('## ')) {
        items.push({ lineIndex: idx, title: line.replace('## ', ''), level: 2, type: 'header' });
      } else if (line.startsWith('### ')) {
        items.push({ lineIndex: idx, title: line.replace('### ', ''), level: 3, type: 'header' });
      }
    });

    return items;
  }, [content, docType]);

  const insertFormatting = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  return (
    <div
      className={`${
        mobileVisible ? 'flex' : 'hidden'
      } lg:flex flex-col h-full bg-[#0c0c10] min-h-[calc(100vh-7.5rem)] lg:min-h-0 border-r border-white/5 relative`}
    >
      {/* Header Bar */}
      <div className="px-3 sm:px-5 py-2.5 border-b border-white/10 flex items-center justify-between bg-zinc-950/70 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Pretext Studio Editor</span>
          </span>

          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              showOutline
                ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Показать / скрыть структуру документа"
          >
            <ListTree className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">Структура</span>
            <span className="text-[10px] bg-white/10 px-1 rounded">{outlineItems.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle (Editor / Split / Highlight) */}
          <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'editor' ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Режим прямого редактирования"
            >
              Код
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-md transition-colors hidden sm:block ${
                viewMode === 'split' ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Сплит: код и подсветка рядом"
            >
              Сплит
            </button>
            <button
              onClick={() => setViewMode('highlight')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'highlight' ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Только подсвеченный синтаксис"
            >
              Подсветка
            </button>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono bg-white/5 px-2 py-1 rounded-md hidden lg:inline">
            {content.length} симв. | {wordCount} слов
          </span>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="px-3 sm:px-4 py-1.5 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-wrap items-center gap-1 overflow-x-auto select-none">
        <button
          onClick={() => insertFormatting('# ', '', 'Заголовок')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Заголовок 1 (H1)"
        >
          <Heading1 className="w-4 h-4 text-violet-400" />
        </button>

        <button
          onClick={() => insertFormatting('## ', '', 'Подзаголовок')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Заголовок 2 (H2)"
        >
          <Heading2 className="w-4 h-4 text-violet-400" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button
          onClick={() => insertFormatting('**', '**', 'жирный текст')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Жирный шрифт"
        >
          <Bold className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={() => insertFormatting('*', '*', 'курсив')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Курсив"
        >
          <Italic className="w-4 h-4 text-pink-400" />
        </button>

        <button
          onClick={() => insertFormatting('`', '`', 'inline_code')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors font-mono text-xs"
          title="Инлайн код"
        >
          <span className="font-bold text-emerald-400">&lt;/&gt;</span>
        </button>

        <button
          onClick={() => insertFormatting('```ts\n', '\n```', 'console.log("Pretext Engine 120 FPS");')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Блок кода"
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button
          onClick={() => insertFormatting('> ', '', 'Цитата-вынос')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Цитата"
        >
          <Quote className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={() => insertFormatting('- ', '', 'Пункт списка')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Маркированный список"
        >
          <List className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={() => insertFormatting('1. ', '', 'Нумерованный пункт')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Нумерованный список"
        >
          <ListOrdered className="w-4 h-4 text-blue-400" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Separator Buttons for Slides & Cards */}
        {docType === 'slide' && (
          <button
            onClick={() => insertFormatting('\n---\n# Новый слайд\nТекст следующего слайда...\n')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 text-xs font-mono font-semibold transition-colors border border-violet-500/30"
            title="Вставить разделитель слайдов (---)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Слайд ---</span>
          </button>
        )}

        {docType === 'card' && (
          <button
            onClick={() => insertFormatting('\n=== BACK ===\n# Обратная сторона\nТекст оборотной стороны...\n')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs font-mono font-semibold transition-colors border border-cyan-500/30"
            title="Вставить разделитель сторон карточки (=== BACK ===)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>=== BACK ===</span>
          </button>
        )}

        <button
          onClick={() => insertFormatting('> [!NOTE]\n> ', '', 'Информационный блок')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          title="Callout Note"
        >
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono hidden sm:inline">Note</span>
        </button>

        <button
          onClick={() => insertFormatting('[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          title="Tech Badge"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono hidden sm:inline">Badge</span>
        </button>

        <button
          onClick={() => insertFormatting('| Параметр | Описание |\n| :--- | :--- |\n| key | value |\n')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Вставить таблицу"
        >
          <Table className="w-4 h-4 text-pink-400" />
        </button>
      </div>

      {/* Main Area: Outline Drawer + Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Outline Slide/Section Drawer */}
        {showOutline && (
          <div className="w-56 shrink-0 border-r border-white/10 bg-zinc-950/90 flex flex-col p-3 overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                {docType === 'slide' ? 'Слайды' : docType === 'card' ? 'Стороны' : 'Разделы'}
              </span>
              {docType === 'slide' && onAddSlide && (
                <button
                  onClick={onAddSlide}
                  className="p-1 rounded bg-violet-600/30 hover:bg-violet-600/60 text-violet-300 text-[10px] flex items-center gap-1"
                  title="Добавить слайд"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              {outlineItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (docType === 'slide' && onSlideChange) {
                      onSlideChange(idx);
                    } else if (docType === 'card' && onToggleCardSide) {
                      if ((idx === 0 && cardSide !== 'front') || (idx === 1 && cardSide !== 'back')) {
                        onToggleCardSide();
                      }
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    docType === 'slide' && activeSlideIndex === idx
                      ? 'bg-violet-600/30 border border-violet-500/40 text-white font-bold'
                      : docType === 'card' && ((idx === 0 && cardSide === 'front') || (idx === 1 && cardSide === 'back'))
                      ? 'bg-cyan-600/30 border border-cyan-500/40 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="truncate flex-1">{item.title}</span>
                  <span className="text-[10px] opacity-40 ml-1">#{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Raw Textarea Editor */}
          {viewMode !== 'highlight' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Введите markdown текст... Он будет плавно огибать препятствия на холсте справа в 120 FPS."
                className="flex-1 w-full p-4 sm:p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[360px]"
                spellCheck={false}
              />
            </div>
          )}

          {/* 2. Syntax Highlighted View */}
          {viewMode !== 'editor' && (
            <div
              className={`flex-1 p-4 sm:p-6 overflow-y-auto bg-zinc-950/40 font-mono text-sm leading-relaxed ${
                viewMode === 'split' ? 'border-l border-white/10 hidden md:block' : ''
              }`}
            >
              <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-wider select-none">
                Подсветка синтаксиса Pretext:
              </div>
              <div className="space-y-0.5">
                {renderHighlightedLines(content)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditorPane;
