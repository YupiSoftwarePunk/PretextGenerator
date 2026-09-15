'use client';

import { useMemo } from 'react';

interface PretextRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PretextRenderer({ content, className = '', style }: PretextRendererProps) {
  const renderedHtml = useMemo(() => {
    return renderPretext(content);
  }, [content]);

  return (
    <div
      className={`pretext-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

// Простой парсер Pretext разметки в HTML
function renderPretext(content: string): string {
  if (!content) return '';

  let html = content;

  // Заголовки
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mb-4">$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mb-3">$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-white mb-2">$1</h3>');

  // Цитаты
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 py-2 text-zinc-300 italic my-4">$1</blockquote>');

  // Списки
  html = html.replace(/^- (.+)$/gm, '<li class="text-zinc-300 ml-6 list-disc">$1</li>');
  html = html.replace(/(<li.*<\/li>)/s, '<ul class="space-y-2 my-4">$1</ul>');

  // Жирный текст
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Курсив
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-zinc-200">$1</em>');

  // Инлайн код
  html = html.replace(/`(.+?)`/g, '<code class="px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-mono text-sm">$1</code>');

  // Блоки кода
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    return `<pre class="bg-zinc-900 rounded-lg p-4 my-4 overflow-x-auto border border-white/10"><code class="text-sm text-zinc-300 font-mono">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Горизонтальная линия (разделитель слайдов)
  html = html.replace(/^---$/gm, '<hr class="border-t-2 border-white/10 my-8" />');

  // Параграфы
  html = html.replace(/^(?!<[h|u|l|b|p|c]|---|>)(.+)$/gm, '<p class="text-zinc-300 leading-relaxed my-3">$1</p>');

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
