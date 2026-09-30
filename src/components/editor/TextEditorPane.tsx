import React, { useRef } from 'react';
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
  Sparkles,
} from 'lucide-react';

interface TextEditorPaneProps {
  content: string;
  onChange: (newContent: string) => void;
  mobileVisible: boolean;
}

export const TextEditorPane: React.FC<TextEditorPaneProps> = ({
  content,
  onChange,
  mobileVisible,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

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
      } lg:flex flex-col h-full bg-[#0c0c10] min-h-[calc(100vh-7.5rem)] lg:min-h-0`}
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
        <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-violet-400" />
          <span>Markdown README Редактор</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            {content.length} симв. | {wordCount} слов
          </span>
        </div>
      </div>

      {/* Floating / Notion-Style Toolbar */}
      <div className="px-3 sm:px-4 py-2 border-b border-white/5 bg-zinc-900/40 backdrop-blur-md flex flex-wrap items-center gap-1 overflow-x-auto">
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
          onClick={() => insertFormatting('*', '*', 'курсивный текст')}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Курсив"
        >
          <Italic className="w-4 h-4 text-pink-400" />
        </button>

        <button
          onClick={() => insertFormatting('`', '`', 'inline-code')}
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
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите markdown текст... Он будет плавно огибать препятствия на холсте справа в 120 FPS."
        className="flex-1 w-full p-4 sm:p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[360px]"
        spellCheck={false}
      />
    </div>
  );
};
