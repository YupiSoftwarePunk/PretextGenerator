'use client';

import { useEffect, useState } from 'react';
import { X, Download, Image, FileCode, FileText, Loader2 } from 'lucide-react';

type ExportFormat = 'png' | 'svg' | 'pdf' | 'webp';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  title?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  quality: number;
  transparentBackground: boolean;
}

const formats: { value: ExportFormat; label: string; icon: typeof Image; description: string }[] = [
  {
    value: 'png',
    label: 'PNG',
    icon: Image,
    description: 'Растровое изображение, лучше для социальных сетей',
  },
  {
    value: 'svg',
    label: 'SVG',
    icon: FileCode,
    description: 'Векторная графика, идеально для масштабирования',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'Документ для печати и презентаций',
  },
  {
    value: 'webp',
    label: 'WebP',
    icon: Image,
    description: 'Современный формат с лучшим сжатием',
  },
];

const scales = [
  { value: 1, label: '1x', description: 'Стандартное качество' },
  { value: 2, label: '2x', description: 'Высокое качество (Retina)' },
  { value: 4, label: '4x', description: 'Максимальное качество' },
];

export default function ExportModal({ isOpen, onClose, onExport, title }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(95);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isExporting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport({
        format,
        scale,
        quality,
        transparentBackground,
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/80"
      onClick={handleBackgroundClick}
    >
      {/* Modal */}
      <div className="glass-card rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
              <Download className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {title || 'Экспорт'}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5
              transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format selection */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-zinc-300">
            Формат файла
          </label>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((f) => {
              const Icon = f.icon;
              const isActive = format === f.value;

              return (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  disabled={isExporting}
                  className={`
                    group text-left p-4 rounded-xl border backdrop-blur-sm
                    transition-all duration-300
                    ${isActive
                      ? 'bg-violet-500/20 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-violet-500/30'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-zinc-400'}`} />
                    <span className={`font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {f.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {f.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scale selection */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-zinc-300">
            Масштаб / Разрешение
          </label>
          <div className="flex gap-3">
            {scales.map((s) => (
              <button
                key={s.value}
                onClick={() => setScale(s.value)}
                disabled={isExporting || format === 'svg'}
                className={`
                  flex-1 px-4 py-3 rounded-lg border backdrop-blur-sm
                  transition-all duration-200
                  ${scale === s.value
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed
                `}
              >
                <div className="font-semibold">{s.label}</div>
                <div className="text-xs mt-1 opacity-70">{s.description}</div>
              </button>
            ))}
          </div>
          {format === 'svg' && (
            <p className="text-xs text-zinc-500 italic">
              SVG — векторный формат, масштаб не применяется
            </p>
          )}
        </div>

        {/* Quality slider */}
        {(format === 'png' || format === 'webp') && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-300">
                Качество
              </label>
              <span className="text-sm text-violet-400 font-semibold">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={isExporting}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gradient-to-r
                [&::-webkit-slider-thumb]:from-violet-500
                [&::-webkit-slider-thumb]:to-cyan-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)]
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Меньше размер</span>
              <span>Лучше качество</span>
            </div>
          </div>
        )}

        {/* Transparent background toggle */}
        <div className="mb-8">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10
            hover:bg-white/5 transition-all cursor-pointer group">
            <input
              type="checkbox"
              checked={transparentBackground}
              onChange={(e) => setTransparentBackground(e.target.checked)}
              disabled={isExporting || format === 'pdf'}
              className="w-5 h-5 rounded border-2 border-white/20 bg-white/5
                checked:bg-gradient-to-r checked:from-violet-500 checked:to-cyan-500
                checked:border-transparent
                focus:ring-2 focus:ring-violet-500/50
                transition-all cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                Прозрачный фон
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Убрать фоновый цвет (не работает для PDF)
              </div>
            </div>
          </label>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-6 py-4 rounded-xl font-semibold text-white
            bg-gradient-to-r from-violet-500 to-cyan-500
            hover:from-violet-600 hover:to-cyan-600
            shadow-[0_0_30px_rgba(139,92,246,0.3)]
            hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-3"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Экспортируем...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Скачать {format.toUpperCase()}
            </>
          )}
        </button>

        {/* Info text */}
        <p className="text-xs text-zinc-500 text-center mt-4">
          Файл будет сохранён в папку загрузок вашего браузера
        </p>
      </div>
    </div>
  );
}
