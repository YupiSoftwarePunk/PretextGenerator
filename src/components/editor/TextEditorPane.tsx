import React from 'react';
import { Code } from 'lucide-react';

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
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={`${
        mobileVisible ? 'flex' : 'hidden'
      } lg:flex flex-col h-full bg-[#0c0c10] min-h-[calc(100vh-7.5rem)] lg:min-h-0`}
    >
      <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/40">
        <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-violet-400" />
          <span>Текст документа</span>
        </span>
        <span className="text-[11px] text-zinc-500 font-mono">
          {content.length} симв. | {wordCount} слов
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите текст... Он будет огибать препятствия на холсте справа."
        className="flex-1 w-full p-4 sm:p-6 bg-transparent text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 min-h-[360px]"
        spellCheck={false}
      />
    </div>
  );
};
