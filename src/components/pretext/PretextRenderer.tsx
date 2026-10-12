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

  // 1. Блоки кода с терминальным оформлением (macOS точки и язык)
  if (exportMode) {
    html = html.replace(/```(\w+)?\r?\n([\s\S]+?)```/g, (_, lang, code) => {
      const langBadge = lang ? `<span style="color: #a1a1aa; font-size: 11px; font-family: monospace; text-transform: uppercase;">${lang}</span>` : '';
      return `<div style="background: #121214; border-radius: 12px; margin: 16px 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.12);">
        <div style="background: rgba(255,255,255,0.04); padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 6px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
          </div>
          ${langBadge}
        </div>
        <pre style="padding: 14px 16px; margin: 0; overflow-x: auto;"><code style="color: #38bdf8; font-family: 'Fira Code', monospace; font-size: 13px; line-height: 1.5; white-space: pre;">${escapeHtml(code.trim())}</code></pre>
      </div>`;
    });
  } else {
    html = html.replace(/```(\w+)?\r?\n([\s\S]+?)```/g, (_, lang, code) => {
      const langBadge = lang ? `<span class="text-[10px] font-mono uppercase text-zinc-400 font-semibold">${lang}</span>` : '';
      return `<div class="bg-zinc-950/90 rounded-xl my-4 overflow-hidden border border-white/10 shadow-lg">
        <div class="bg-white/5 px-3 py-2 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          ${langBadge}
        </div>
        <pre class="p-4 overflow-x-auto"><code class="text-xs sm:text-sm text-cyan-300 font-mono whitespace-pre leading-relaxed">${escapeHtml(code.trim())}</code></pre>
      </div>`;
    });
  }

  // 2. Полный набор GitHub Callouts: NOTE, TIP, IMPORTANT, WARNING, CAUTION
  if (exportMode) {
    html = html.replace(/^> \[!NOTE\]\s*(.+)$/gm, '<div style="background: rgba(6,182,212,0.12); border-left: 4px solid #22d3ee; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #ecfeff; font-size: 13px;"><strong style="color: #22d3ee; display: block; margin-bottom: 4px;">📝 NOTE</strong>$1</div>');
    html = html.replace(/^> \[!TIP\]\s*(.+)$/gm, '<div style="background: rgba(16,185,129,0.12); border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #d1fae5; font-size: 13px;"><strong style="color: #10b981; display: block; margin-bottom: 4px;">💡 TIP</strong>$1</div>');
    html = html.replace(/^> \[!IMPORTANT\]\s*(.+)$/gm, '<div style="background: rgba(139,92,246,0.12); border-left: 4px solid #a855f7; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #f3e8ff; font-size: 13px;"><strong style="color: #a855f7; display: block; margin-bottom: 4px;">⚡ IMPORTANT</strong>$1</div>');
    html = html.replace(/^> \[!WARNING\]\s*(.+)$/gm, '<div style="background: rgba(245,158,11,0.12); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #fef3c7; font-size: 13px;"><strong style="color: #f59e0b; display: block; margin-bottom: 4px;">⚠️ WARNING</strong>$1</div>');
    html = html.replace(/^> \[!CAUTION\]\s*(.+)$/gm, '<div style="background: rgba(244,63,94,0.12); border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 8px; margin: 12px 0; color: #ffe4e6; font-size: 13px;"><strong style="color: #f43f5e; display: block; margin-bottom: 4px;">🛑 CAUTION</strong>$1</div>');
  } else {
    html = html.replace(/^> \[!NOTE\]\s*(.+)$/gm, '<div class="bg-cyan-950/30 border-l-4 border-cyan-400 p-3.5 rounded-xl my-3 text-cyan-100 font-sans text-xs leading-relaxed"><strong class="text-cyan-400 block mb-1 font-mono">📝 NOTE:</strong>$1</div>');
    html = html.replace(/^> \[!TIP\]\s*(.+)$/gm, '<div class="bg-emerald-950/30 border-l-4 border-emerald-400 p-3.5 rounded-xl my-3 text-emerald-100 font-sans text-xs leading-relaxed"><strong class="text-emerald-400 block mb-1 font-mono">💡 TIP:</strong>$1</div>');
    html = html.replace(/^> \[!IMPORTANT\]\s*(.+)$/gm, '<div class="bg-violet-950/30 border-l-4 border-violet-400 p-3.5 rounded-xl my-3 text-violet-100 font-sans text-xs leading-relaxed"><strong class="text-violet-400 block mb-1 font-mono">⚡ IMPORTANT:</strong>$1</div>');
    html = html.replace(/^> \[!WARNING\]\s*(.+)$/gm, '<div class="bg-amber-950/30 border-l-4 border-amber-400 p-3.5 rounded-xl my-3 text-amber-100 font-sans text-xs leading-relaxed"><strong class="text-amber-400 block mb-1 font-mono">⚠️ WARNING:</strong>$1</div>');
    html = html.replace(/^> \[!CAUTION\]\s*(.+)$/gm, '<div class="bg-rose-950/30 border-l-4 border-rose-400 p-3.5 rounded-xl my-3 text-rose-100 font-sans text-xs leading-relaxed"><strong class="text-rose-400 block mb-1 font-mono">🛑 CAUTION:</strong>$1</div>');
  }

  // 3. Таблицы Markdown (| col1 | col2 |)
  html = html.replace(/(?:^\|.+?\|\r?\n)+/gm, (tableMatch) => {
    const rows = tableMatch.trim().split('\n');
    if (rows.length < 2) return tableMatch;

    let tableHtml = exportMode
      ? '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; font-size: 13px;">'
      : '<div class="overflow-x-auto my-4 rounded-xl border border-white/10 shadow-md"><table class="w-full text-left text-xs font-mono">';

    rows.forEach((row, rIdx) => {
      if (row.includes('---')) return; // разделитель заголовка
      const cols = row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
      const isHeader = rIdx === 0;

      if (exportMode) {
        tableHtml += `<tr style="background: ${isHeader ? 'rgba(255,255,255,0.06)' : 'transparent'}; border-bottom: 1px solid rgba(255,255,255,0.08);">`;
        cols.forEach((col) => {
          tableHtml += isHeader
            ? `<th style="padding: 10px 14px; color: #fff; font-weight: bold; text-align: left;">${col.trim()}</th>`
            : `<td style="padding: 8px 14px; color: #d4d4d8;">${col.trim()}</td>`;
        });
        tableHtml += '</tr>';
      } else {
        tableHtml += `<tr class="${isHeader ? 'bg-white/10 text-white font-bold' : 'border-t border-white/5 text-zinc-300 hover:bg-white/5'}">`;
        cols.forEach((col) => {
          tableHtml += isHeader
            ? `<th class="p-3 text-zinc-100 font-bold">${col.trim()}</th>`
            : `<td class="p-2.5 text-zinc-300">${col.trim()}</td>`;
        });
        tableHtml += '</tr>';
      }
    });

    tableHtml += exportMode ? '</table>' : '</table></div>';
    return tableHtml;
  });

  // 4. Заголовки (H1-H3)
  if (exportMode) {
    html = html.replace(/^# (.+)$/gm, '<h1 style="font-size: 1.875rem; font-weight: 800; color: #ffffff; margin-bottom: 1rem; line-height: 1.25; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.4rem; font-weight: 700; color: #f4f4f5; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.15rem; font-weight: 600; color: #e4e4e7; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>');
  } else {
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-4 pb-2 border-b border-white/10 tracking-tight leading-snug">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl sm:text-2xl font-bold text-zinc-100 mt-6 mb-3 tracking-tight">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg sm:text-xl font-semibold text-zinc-200 mt-4 mb-2">$1</h3>');
  }

  // 5. Обычные цитаты
  if (exportMode) {
    html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left: 4px solid #8b5cf6; padding: 8px 16px; color: #d4d4d8; font-style: italic; margin: 14px 0; background: rgba(139,92,246,0.08); border-radius: 0 8px 8px 0;">$1</blockquote>');
  } else {
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 py-2 my-4 text-zinc-300 italic bg-violet-950/20 rounded-r-xl">$1</blockquote>');
  }

  // 6. Задачи / Checkboxes
  html = html.replace(/^- \[x\]\s*(.+)$/gm, '<li class="text-emerald-400 ml-5 list-none flex items-center gap-2 my-1"><span class="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center justify-center text-[10px]">✓</span><span>$1</span></li>');
  html = html.replace(/^- \[ \]\s*(.+)$/gm, '<li class="text-zinc-400 ml-5 list-none flex items-center gap-2 my-1"><span class="w-4 h-4 rounded bg-white/5 border border-white/20 inline-block"></span><span>$1</span></li>');

  // 7. Списки
  if (exportMode) {
    html = html.replace(/^- (.+)$/gm, '<li style="color: #d4d4d8; margin-left: 1.5rem; list-style-type: disc; margin-bottom: 0.25rem;">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li style="color: #d4d4d8; margin-left: 1.5rem; list-style-type: decimal; margin-bottom: 0.25rem;">$1</li>');
  } else {
    html = html.replace(/^- (.+)$/gm, '<li class="text-zinc-300 ml-6 list-disc my-1 leading-relaxed">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-zinc-300 ml-6 list-decimal my-1 leading-relaxed">$1</li>');
  }

  // 8. Жирный, курсив, зачеркнутый
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-zinc-200">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-zinc-500">$1</del>');

  // 9. Инлайн код
  if (exportMode) {
    html = html.replace(/`(.+?)`/g, '<code style="padding: 0.15rem 0.45rem; border-radius: 0.3rem; background: #27272a; color: #38bdf8; font-family: monospace; font-size: 0.85rem;">$1</code>');
  } else {
    html = html.replace(/`(.+?)`/g, '<code class="px-2 py-0.5 rounded-md bg-zinc-800 border border-white/5 text-cyan-300 font-mono text-xs sm:text-sm">$1</code>');
  }

  // 10. Бейджи (Shields.io style markdown images: [![badge](url)](link) or ![](url))
  html = html.replace(/\[!\[([^\]]*?)\]\(([^)]+)\)\]\(([^)]+)\)/g, '<a href="$3" target="_blank" rel="noreferrer" style="display: inline-block; margin-right: 6px; margin-bottom: 6px;"><img src="$2" alt="$1" style="height: 20px; vertical-align: middle;" /></a>');
  html = html.replace(/!\[([^\]]*?)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1);" />');

  // 11. Горизонтальная линия
  if (exportMode) {
    html = html.replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid rgba(255,255,255,0.1); margin: 2rem 0;" />');
  } else {
    html = html.replace(/^---$/gm, '<hr class="border-t-2 border-white/10 my-8" />');
  }

  // 12. Параграфы
  if (exportMode) {
    html = html.replace(/^(?!<[h|u|l|b|p|c|t|d|p|r]|---|>)(.+)$/gm, '<p style="color: #d4d4d8; line-height: 1.65; margin: 0.75rem 0;">$1</p>');
  } else {
    html = html.replace(/^(?!<[h|u|l|b|p|c|t|d|p|r]|---|>)(.+)$/gm, '<p class="text-zinc-300 leading-relaxed my-2.5">$1</p>');
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
