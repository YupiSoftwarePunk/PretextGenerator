'use client';

import { useMemo } from 'react';

interface PretextRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  exportMode?: boolean; // Режим экспорта - использует inline styles вместо Tailwind
}

export default function PretextRenderer({ content, className = '', style, exportMode = false }: PretextRendererProps) {
  const renderedHtml = useMemo(() => {
    return renderPretext(content, exportMode);
  }, [content, exportMode]);

  return (
    <div
      className={exportMode ? '' : `pretext-content ${className}`}
      style={exportMode ? { ...getExportStyles(), ...style } : style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

// Inline стили для экспорта (без Tailwind/oklab)
function getExportStyles(): React.CSSProperties {
  return {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#FAFAFA',
    lineHeight: '1.6',
  };
}

// Парсер Pretext разметки в HTML с поддержкой полного набора README элементов
function renderPretext(content: string, exportMode: boolean): string {
  if (!content) return '';

  let html = content;

  // Callouts: > [!NOTE] text and > [!WARNING] text
  if (exportMode) {
    html = html.replace(/^> \[!NOTE\]\s*(.+)$/gm, '<div style="background: rgba(6,182,212,0.15); border-left: 4px solid #22d3ee; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #ecfeff; font-family: monospace; font-size: 13px;"><strong style="color: #22d3ee; display: block; margin-bottom: 4px;">📝 NOTE:</strong>$1</div>');
    html = html.replace(/^> \[!WARNING\]\s*(.+)$/gm, '<div style="background: rgba(245,158,11,0.15); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #fef3c7; font-family: monospace; font-size: 13px;"><strong style="color: #f59e0b; display: block; margin-bottom: 4px;">⚠️ WARNING:</strong>$1</div>');
  } else {
    html = html.replace(/^> \[!NOTE\]\s*(.+)$/gm, '<div class="bg-cyan-950/40 border-l-4 border-cyan-400 p-3 rounded-lg my-3 text-cyan-100 font-mono text-xs"><strong class="text-cyan-400 block mb-1">📝 NOTE:</strong>$1</div>');
    html = html.replace(/^> \[!WARNING\]\s*(.+)$/gm, '<div class="bg-amber-950/40 border-l-4 border-amber-400 p-3 rounded-lg my-3 text-amber-100 font-mono text-xs"><strong class="text-amber-400 block mb-1">⚠️ WARNING:</strong>$1</div>');
  }

  // Заголовки
  if (exportMode) {
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 1.875rem; font-weight: bold; color: #ffffff; margin-bottom: 1rem;">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; color: #ffffff; margin-bottom: 0.75rem;">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 0.5rem;">$1</h3>');
  } else {
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mb-4">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mb-3">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-white mb-2">$1</h3>');
  }

  // Обычные цитаты
  if (exportMode) {
    html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left: 4px solid #8b5cf6; padding-left: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; color: #d4d4d8; font-style: italic; margin: 1rem 0;">$1</blockquote>');
  } else {
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 py-2 text-zinc-300 italic my-4">$1</blockquote>');
  }

  // Маркированные списки
  if (exportMode) {
    html = html.replace(/^- (.+)$/gm, '<li style="color: #d4d4d8; margin-left: 1.5rem; list-style-type: disc;">$1</li>');
  } else {
    html = html.replace(/^- (.+)$/gm, '<li class="text-zinc-300 ml-6 list-disc">$1</li>');
  }

  // Нумерованные списки
  if (exportMode) {
    html = html.replace(/^\d+\. (.+)$/gm, '<li style="color: #d4d4d8; margin-left: 1.5rem; list-style-type: decimal;">$1</li>');
  } else {
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-zinc-300 ml-6 list-decimal">$1</li>');
  }

  // Жирный текст
  if (exportMode) {
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold; color: #ffffff;">$1</strong>');
  } else {
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  }

  // Курсив
  if (exportMode) {
    html = html.replace(/\*(.+?)\*/g, '<em style="font-style: italic; color: #e4e4e7;">$1</em>');
  } else {
    html = html.replace(/\*(.+?)\*/g, '<em class="italic text-zinc-200">$1</em>');
  }

  // Инлайн код
  if (exportMode) {
    html = html.replace(/`(.+?)`/g, '<code style="padding: 0.125rem 0.5rem; border-radius: 0.25rem; background: #27272a; color: #06b6d4; font-family: monospace; font-size: 0.875rem;">$1</code>');
  } else {
    html = html.replace(/`(.+?)`/g, '<code class="px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-mono text-sm">$1</code>');
  }

  // Блоки кода
  if (exportMode) {
    html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => {
      return `<pre style="background: #18181b; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1);"><code style="color: #d4d4d8; font-family: monospace; font-size: 0.875rem;">${escapeHtml(code.trim())}</code></pre>`;
    });
  } else {
    html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => {
      return `<pre class="bg-zinc-900 rounded-lg p-4 my-4 overflow-x-auto border border-white/10"><code class="text-sm text-zinc-300 font-mono">${escapeHtml(code.trim())}</code></pre>`;
    });
  }

  // Бейджи (Shields.io style markdown images: [![badge](url)](link) or ![](url))
  html = html.replace(/\[!\[([^\]]*?)\]\(([^)]+)\)\]\(([^)]+)\)/g, '<a href="$3" target="_blank" rel="noreferrer" style="display: inline-block; margin-right: 6px; margin-bottom: 6px;"><img src="$2" alt="$1" style="height: 20px; vertical-align: middle;" /></a>');
  html = html.replace(/!\[([^\]]*?)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 6px; margin: 8px 0;" />');

  // Горизонтальная линия
  if (exportMode) {
    html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid rgba(255,255,255,0.1); margin: 2rem 0;" />');
  } else {
    html = html.replace(/^---$/gm, '<hr class="border-t-2 border-white/10 my-8" />');
  }

  // Параграфы
  if (exportMode) {
    html = html.replace(/^(?!<[h|u|l|b|p|c|t|d]|---|>)(.+)$/gm, '<p style="color: #d4d4d8; line-height: 1.625; margin: 0.75rem 0;">$1</p>');
  } else {
    html = html.replace(/^(?!<[h|u|l|b|p|c|t|d]|---|>)(.+)$/gm, '<p class="text-zinc-300 leading-relaxed my-3">$1</p>');
  }

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
