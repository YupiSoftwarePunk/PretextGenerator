'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  FileText,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import PretextRenderer from '@/components/pretext/PretextRenderer';

// Preset data for Slide Widget
const SLIDE_PREVIEWS = [
  {
    title: 'Архитектура Нового Поколения',
    tag: 'SLIDE 1/3',
    content: `# Pretext Engine\n\n> Сверхбыстрый расчет типографики\n\n- **120 FPS** частота кадров\n- **0 DOM Reflows** при скролле\n- Поддержка кругов и многоугольников`,
  },
  {
    title: 'Многоколоночные Макеты',
    tag: 'SLIDE 2/3',
    content: `# Журнальные Потоки\n\nТекст плавно перетекает между колонками, огибая любые интерактивные врезки и медиа.\n\n\`\`\`ts\nconst layout = engine.calculateLines(text, obstacles);\n\`\`\``,
  },
  {
    title: 'Экспорт в Высоком Разрешении',
    tag: 'SLIDE 3/3',
    content: `# Мгновенный Экспорт\n\n> Сохраняйте в один клик\n\n- Экспорт в **PNG** и **PDF**\n- Автономный чистый **HTML**\n- Сохранение в LocalStorage`,
  },
];

// Preset data for Card Widget
const CARD_PREVIEWS = [
  {
    id: 'vdom',
    term: 'Virtual DOM & Pretext',
    category: 'REACT ARCHITECTURE',
    front: 'Как технология Pretext взаимодействует со стандартным Virtual DOM?',
    back: `### Математический слой\n\nPretext производит расчет геометрии в **памяти Canvas**, минуя дорогостоящие фазы Reconcile и Layout Shift.\n\n\`\`\`ts\n// 0 перерисовок DOM\nengine.calculateWordLayout(text, obstacles);\n\`\`\``,
  },
  {
    id: 'closure',
    term: 'Замыкания и Скоуп',
    category: 'JAVASCRIPT CORE',
    front: 'Что такое лексическое окружение и как замыкания сохраняют состояние?',
    back: `### Функция + Окружение\n\nЗамыкание дает функции доступ к внешней области видимости даже после завершения внешней функции.\n\n\`\`\`js\nfunction createCounter() {\n  let c = 0;\n  return () => ++c;\n}\n\`\`\``,
  },
];

// Preset data for Cheatsheet Widget
const CHEATSHEET_TABS = {
  git: [
    { cmd: 'git init', desc: 'Инициализировать репозиторий' },
    { cmd: 'git checkout -b <branch>', desc: 'Создать и перейти в ветку' },
    { cmd: 'git commit -m "feat: pretext"', desc: 'Коммит с сообщением' },
    { cmd: 'git push origin main', desc: 'Отправить изменения на GitHub' },
  ],
  react: [
    { cmd: 'const [val, setVal] = useState()', desc: 'Состояние компонента' },
    { cmd: 'useSyncExternalStore(sub, get, ssr)', desc: 'Безопасная гидратация данных' },
    { cmd: 'useMemo(() => calc(a), [a])', desc: 'Мемоизация тяжелых вычислений' },
    { cmd: 'useCallback(() => fn(a), [a])', desc: 'Кэширование функций' },
  ],
  shortcuts: [
    { cmd: 'Ctrl + Shift + P', desc: 'Командная палитра VS Code' },
    { cmd: 'Alt + ↑ / ↓', desc: 'Переместить строку вверх/вниз' },
    { cmd: 'Ctrl + D', desc: 'Выбрать следующее вхождение' },
    { cmd: 'Ctrl + B', desc: 'Скрыть боковую панель' },
  ],
};

export const InteractiveFormatsSection: React.FC = () => {
  // Slides state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Card Flip state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Cheatsheet state
  const [activeCheatTab, setActiveCheatTab] = useState<'git' | 'react' | 'shortcuts'>('git');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDE_PREVIEWS.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDE_PREVIEWS.length) % SLIDE_PREVIEWS.length);
  };

  const activeCard = CARD_PREVIEWS[currentCardIndex];

  return (
    <section id="formats" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-16 space-y-2 sm:space-y-3 px-2">
        <h2 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight break-words">
          Форматы нового поколения
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-xs sm:text-base">
          Интерактивные презентации, флэшкарды с 3D-переворотом и удобные шпаргалки. Опробуйте каждый формат вживую.
        </p>
      </div>

      {/* 3 Interactive Cards Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch w-full">
        {/* WIDGET 1: Interactive Slide Player */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-violet-500/30 flex flex-col justify-between hover:border-violet-500/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all group w-full min-w-0">
          <div>
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 min-w-[40px] rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5 text-violet-400 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">Презентации и Слайды</h3>
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-400 block truncate">Интерактивный плеер</span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-violet-300 bg-violet-950/60 border border-violet-500/30 px-2.5 py-1 rounded-md shrink-0">
                {SLIDE_PREVIEWS[currentSlideIndex].tag}
              </span>
            </div>

            {/* Slide Screen */}
            <div className="relative w-full h-[220px] rounded-2xl bg-zinc-950/90 border border-white/10 p-3.5 sm:p-5 overflow-hidden flex flex-col justify-between shadow-inner">
              <div className="overflow-y-auto pr-1 text-xs">
                <PretextRenderer content={SLIDE_PREVIEWS[currentSlideIndex].content} />
              </div>

              {/* Player Controls */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {SLIDE_PREVIEWS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      aria-label={`Слайд ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        currentSlideIndex === idx ? 'w-6 bg-violet-500' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    aria-label="Предыдущий слайд"
                    className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 flex items-center justify-center transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Следующий слайд"
                    className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 flex items-center justify-center transition-colors shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 min-h-[40px]">
            <span className="text-xs text-zinc-500 font-mono">Кинетические переходы</span>
            <Link
              href="/editor?type=slide"
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors group-hover:translate-x-1 py-1"
            >
              <span>Создать слайд</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>

        {/* WIDGET 2: Interactive 3D Flip Card */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all group w-full min-w-0">
          <div>
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 min-w-[40px] rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">Обучающие Карточки</h3>
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-400 block truncate">3D-флип интерактив</span>
                </div>
              </div>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-3 py-1.5 rounded-lg hover:bg-cyan-900/60 transition-colors min-h-[36px] shrink-0 active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5 shrink-0" />
                <span>{isFlipped ? 'Лицевая' : 'Перевернуть'}</span>
              </button>
            </div>

            {/* Flip Card Stage */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full h-[220px] rounded-2xl bg-zinc-950/90 border border-white/10 p-3.5 sm:p-5 cursor-pointer flex flex-col justify-between shadow-inner select-none transition-transform duration-300"
            >
              {!isFlipped ? (
                // Front Side
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                      {activeCard.category}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white mt-2.5 mb-1.5 truncate">{activeCard.term}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{activeCard.front}</p>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Нажмите на карточку для ответа</span>
                  </div>
                </div>
              ) : (
                // Back Side
                <div className="flex flex-col justify-between h-full overflow-y-auto text-xs">
                  <PretextRenderer content={activeCard.back} />
                  <div className="text-[10px] font-mono text-cyan-400 mt-2">
                    ✓ Претекст-верстка с кодом
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 min-h-[40px]">
            <button
              onClick={() => {
                setCurrentCardIndex((prev) => (prev + 1) % CARD_PREVIEWS.length);
                setIsFlipped(false);
              }}
              className="text-xs text-zinc-400 hover:text-white font-mono transition-colors py-1 min-h-[36px] flex items-center"
            >
              Следующая тема ({currentCardIndex + 1}/{CARD_PREVIEWS.length})
            </button>
            <Link
              href="/editor?type=card"
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-1 py-1"
            >
              <span>Создать</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>

        {/* WIDGET 3: Interactive Live Cheatsheet */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-pink-500/30 flex flex-col justify-between hover:border-pink-500/50 hover:shadow-[0_0_35px_rgba(236,72,153,0.25)] transition-all group md:col-span-2 lg:col-span-1 w-full min-w-0">
          <div>
            {/* Top Bar: Responsive with menu on next line for mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 min-w-[40px] rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center shrink-0">
                  <ScrollText className="w-5 h-5 text-pink-400 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">Интерактивные Шпаргалки</h3>
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-400 block truncate">Быстрое копирование</span>
                </div>
              </div>

              {/* Tabs Menu: Full-width segmented control on mobile, compact on tablet/desktop */}
              <div className="w-full sm:w-auto flex items-center bg-zinc-900/90 p-1 rounded-xl border border-white/10 text-xs font-mono shrink-0">
                {(['git', 'react', 'shortcuts'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveCheatTab(t)}
                    className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg transition-all uppercase min-h-[38px] flex items-center justify-center font-medium active:scale-95 ${
                      activeCheatTab === t
                        ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Cheatsheet Snippets List */}
            <div className="relative w-full h-[220px] rounded-2xl bg-zinc-950/90 border border-white/10 p-2 sm:p-3 overflow-y-auto space-y-2 shadow-inner">
              {CHEATSHEET_TABS[activeCheatTab].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopyCmd(item.cmd)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/40 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group/cmd min-h-[44px] gap-2 active:scale-[0.99]"
                >
                  <div className="min-w-0 flex-1 pr-1">
                    <code className="text-xs text-pink-300 font-mono block truncate font-medium">
                      {item.cmd}
                    </code>
                    <span className="text-[10px] text-zinc-500 block truncate">{item.desc}</span>
                  </div>

                  <button
                    className="w-8 h-8 rounded-lg bg-white/5 group-hover/cmd:bg-pink-600 group-hover/cmd:text-white text-zinc-400 transition-colors flex items-center justify-center shrink-0"
                    title="Копировать"
                    aria-label={`Копировать команду ${item.cmd}`}
                  >
                    {copiedCmd === item.cmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 min-h-[40px]">
            <span className="text-xs text-zinc-500 font-mono">Справочники и команды</span>
            <Link
              href="/editor?type=cheatsheet"
              className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors group-hover:translate-x-1 py-1"
            >
              <span>Создать</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFormatsSection;
