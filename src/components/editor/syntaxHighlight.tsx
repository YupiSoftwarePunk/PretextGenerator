import React from 'react';

/**
 * Tokenize inline Markdown text into highlighted React nodes
 */
export function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  // Regex for badges, links, bold, italic, code
  const tokenRegex = /(\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    const key = `${keyPrefix}_${i}`;
    if (!part) return null;

    // GitHub badge: [![...](...)](...)
    if (part.startsWith('[![') && part.includes(')(')) {
      return (
        <span key={key} className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/30">
          {part}
        </span>
      );
    }

    // Markdown Image: ![...](...)
    if (part.startsWith('![') && part.endsWith(')')) {
      return (
        <span key={key} className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-500/30">
          {part}
        </span>
      );
    }

    // Markdown Link: [...] (...)
    if (part.startsWith('[') && part.endsWith(')')) {
      return (
        <span key={key} className="text-sky-300 underline decoration-sky-500/50">
          {part}
        </span>
      );
    }

    // Inline Code: `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <span key={key} className="text-pink-300 bg-pink-950/50 px-1 py-0.5 rounded font-mono border border-pink-500/20">
          {part}
        </span>
      );
    }

    // Bold: **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={key} className="text-amber-200 font-bold">
          {part}
        </span>
      );
    }

    // Italic: *...*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <span key={key} className="text-purple-300 italic">
          {part}
        </span>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

/**
 * Line-by-line Markdown & Pretext syntax highlighter
 */
export function renderHighlightedLines(content: string): React.ReactNode {
  const lines = content.split('\n');
  let inCodeBlock = false;

  return lines.map((line, lineIndex) => {
    const key = `line_${lineIndex}`;

    // Code block fences
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return (
        <div key={key} className="text-emerald-400 font-mono font-bold bg-emerald-950/30 px-1">
          {line || ' '}
        </div>
      );
    }

    if (inCodeBlock) {
      return (
        <div key={key} className="text-emerald-300/90 font-mono bg-emerald-950/20 px-1">
          {line || ' '}
        </div>
      );
    }

    // Slide separator: ---
    if (/^---\s*$/.test(line)) {
      return (
        <div key={key} className="my-1 py-0.5 px-2 rounded bg-violet-900/50 border border-violet-500/40 text-violet-200 text-xs font-mono font-bold flex items-center justify-between select-none">
          <span>---</span>
          <span className="text-[10px] uppercase tracking-wider text-violet-300">★ Разделитель слайда</span>
        </div>
      );
    }

    // Card back separator: === BACK ===
    if (/^=== BACK ===\s*$/.test(line.trim())) {
      return (
        <div key={key} className="my-1 py-0.5 px-2 rounded bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold flex items-center justify-between select-none">
          <span>=== BACK ===</span>
          <span className="text-[10px] uppercase tracking-wider text-cyan-300">✪ Обратная сторона карточки</span>
        </div>
      );
    }

    // Headers H1
    if (line.startsWith('# ')) {
      return (
        <div key={key} className="text-violet-300 font-bold text-base border-b border-violet-500/20 pb-0.5">
          {line}
        </div>
      );
    }

    // Headers H2
    if (line.startsWith('## ')) {
      return (
        <div key={key} className="text-violet-400 font-semibold text-sm">
          {line}
        </div>
      );
    }

    // Headers H3, H4
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      return (
        <div key={key} className="text-fuchsia-300 font-medium text-xs">
          {line}
        </div>
      );
    }

    // Callouts: > [!NOTE], > [!TIP], > [!WARNING]
    if (line.startsWith('> [!')) {
      return (
        <div key={key} className="text-amber-300 font-bold bg-amber-950/30 px-1.5 py-0.5 rounded border-l-2 border-amber-400">
          {line}
        </div>
      );
    }

    // Quotes: > ...
    if (line.startsWith('> ')) {
      return (
        <div key={key} className="text-zinc-400 italic bg-white/5 px-1.5 border-l-2 border-zinc-500">
          {line}
        </div>
      );
    }

    // Unordered lists: - ..., * ...
    if (/^\s*[-*]\s+/.test(line)) {
      return (
        <div key={key} className="text-zinc-300 pl-2">
          <span className="text-cyan-400 font-bold mr-1.5">•</span>
          {renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ''), key)}
        </div>
      );
    }

    // Ordered lists: 1. ...
    if (/^\s*\d+\.\s+/.test(line)) {
      return (
        <div key={key} className="text-zinc-300 pl-2">
          {renderInlineMarkdown(line, key)}
        </div>
      );
    }

    // Regular line with inline markup
    return (
      <div key={key} className="text-zinc-300 min-h-[1.5em]">
        {renderInlineMarkdown(line, key)}
      </div>
    );
  });
}
