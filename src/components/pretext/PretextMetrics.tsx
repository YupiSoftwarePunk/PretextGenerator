'use client';

import { HTMLAttributes } from 'react';

interface PretextMetricsProps extends HTMLAttributes<HTMLDivElement> {
  computeTime: number;
  lineCount: number;
  canvasCacheActive: boolean;
  domReflows: number;
  position?: 'top' | 'bottom';
}

export default function PretextMetrics({
  computeTime,
  lineCount,
  canvasCacheActive,
  domReflows,
  position = 'bottom',
  className = '',
  ...props
}: PretextMetricsProps) {
  return (
    <div
      className={`
        rounded-lg
        bg-zinc-900/80
        backdrop-blur-sm
        border border-violet-500/30
        shadow-lg shadow-violet-500/10
        px-4 py-3
        ${position === 'top' ? 'mb-4' : 'mt-4'}
        ${className}
      `}
      {...props}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-mono">
        <div className="flex flex-col">
          <span className="text-violet-400/70 text-xs uppercase tracking-wider mb-1">
            Время расчета
          </span>
          <span className="text-zinc-100 font-medium">
            ~{computeTime.toFixed(2)}ms
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-violet-400/70 text-xs uppercase tracking-wider mb-1">
            Строк
          </span>
          <span className="text-zinc-100 font-medium">
            {lineCount}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-violet-400/70 text-xs uppercase tracking-wider mb-1">
            Canvas measure cache
          </span>
          <span className={`font-medium ${canvasCacheActive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {canvasCacheActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-violet-400/70 text-xs uppercase tracking-wider mb-1">
            DOM reflows
          </span>
          <span className="text-zinc-100 font-medium">
            {domReflows}
          </span>
        </div>
      </div>
    </div>
  );
}
