import { DocumentType } from '@/types';
import { PretextObstacle, PresetBadgeTemplate } from './types';

export const PRESET_BADGES: PresetBadgeTemplate[] = [
  {
    id: 'badge_stars',
    kind: 'badge',
    label: '⭐ 5.2k Stars',
    sublabel: 'GitHub Trending',
    theme: 'amber',
    shape: 'rect',
    width: 140,
    height: 75,
  },
  {
    id: 'badge_license',
    kind: 'badge',
    label: '🛡 MIT License',
    sublabel: 'Open Source',
    theme: 'emerald',
    shape: 'rect',
    width: 140,
    height: 75,
  },
  {
    id: 'badge_fps',
    kind: 'badge',
    label: '⚡ 120 FPS Flow',
    sublabel: 'Zero DOM Reflow',
    theme: 'violet',
    shape: 'circle',
    width: 110,
    height: 110,
  },
  {
    id: 'badge_react',
    kind: 'sticker',
    label: '⚛️ React 19',
    sublabel: 'Full Support',
    theme: 'cyan',
    shape: 'circle',
    width: 110,
    height: 110,
  },
  {
    id: 'badge_ts',
    kind: 'badge',
    label: '📘 TypeScript 5',
    sublabel: 'Type-Safe Engine',
    theme: 'indigo',
    shape: 'rect',
    width: 150,
    height: 75,
  },
  {
    id: 'badge_quote_tip',
    kind: 'quote',
    label: '💡 Про-совет',
    sublabel: 'Используйте стикеры для акцентов',
    theme: 'amber',
    shape: 'rect',
    width: 170,
    height: 90,
  },
  {
    id: 'badge_warn',
    kind: 'callout',
    label: '⚠️ Внимание',
    sublabel: 'Не блокируйте основной поток',
    theme: 'rose',
    shape: 'rect',
    width: 170,
    height: 85,
  },
  {
    id: 'badge_metric',
    kind: 'metric',
    label: '📊 0.16 ms',
    sublabel: 'Layout Calc Latency',
    theme: 'emerald',
    shape: 'rect',
    width: 140,
    height: 75,
  },
];

export const PRESETS: Record<DocumentType, { obstacles: Omit<PretextObstacle, 'id'>[]; text: string }> = {
  slide: {
    obstacles: [
      {
        x: 290,
        y: 40,
        width: 170,
        height: 120,
        shape: 'rect',
        gap: 16,
        kind: 'badge',
        label: '⚡ 120 FPS',
        theme: 'violet',
      },
    ],
    text: `# Pretext Engine

> Сверхбыстрый расчет типографики

- **120 FPS** частота кадров
- **0 DOM Reflows** при скролле
- Поддержка кругов и многоугольников

---

# Журнальные Потоки

Текст плавно перетекает между колонками, огибая любые интерактивные врезки и медиа.

\`\`\`ts
const layout = engine.calculateLines(text, obstacles);
\`\`\`

---

# Мгновенный Экспорт

> Сохраняйте в один клик

- Экспорт в **PNG** и **PDF**
- Автономный чистый **HTML**
- Сохранение в LocalStorage`,
  },
  card: {
    obstacles: [
      {
        x: 180,
        y: 50,
        width: 130,
        height: 130,
        shape: 'circle',
        gap: 14,
        kind: 'image',
        label: '⚛️ React Core',
        theme: 'cyan',
      },
    ],
    text: `[CATEGORY: REACT ARCHITECTURE]
[TERM: Virtual DOM & Pretext]
# Virtual DOM & Pretext

Как технология Pretext взаимодействует со стандартным Virtual DOM? 

Обратите внимание на органичное огибание контура медиа-блока. Нажмите «Перевернуть карточку» для просмотра ответа.

=== BACK ===

### Математический слой

Pretext производит расчет геометрии в **памяти Canvas**, минуя дорогостоящие фазы Reconcile и Layout Shift.

\`\`\`ts
// 0 перерисовок DOM
engine.calculateWordLayout(text, obstacles);
\`\`\`

=== NEXT_CARD ===

[CATEGORY: JAVASCRIPT CORE]
[TERM: Замыкания и Скоуп]
# Замыкания и Скоуп

Что такое лексическое окружение и как замыкания сохраняют состояние?

=== BACK ===

### Функция + Окружение

Замыкание дает функции доступ к внешней области видимости даже после завершения внешней функции.

\`\`\`js
function createCounter() {
  let c = 0;
  return () => ++c;
}
\`\`\``,
  },
  cheatsheet: {
    obstacles: [
      {
        x: 280,
        y: 40,
        width: 160,
        height: 100,
        shape: 'rect',
        gap: 14,
        kind: 'quote',
        label: '💡 Быстрый старт',
        theme: 'amber',
      },
    ],
    text: `# Интерактивная Шпаргалка Разработчика

## Git Команды
\`git init\` — Инициализировать репозиторий
\`git checkout -b <branch>\` — Создать и перейти в ветку
\`git commit -m "feat: pretext"\` — Коммит с сообщением
\`git push origin main\` — Отправить изменения на GitHub

## React & Hooks
\`const [val, setVal] = useState()\` — Состояние компонента
\`useSyncExternalStore(sub, get, ssr)\` — Безопасная гидратация данных
\`useMemo(() => calc(a), [a])\` — Мемоизация тяжелых вычислений
\`useCallback(() => fn(a), [a])\` — Кэширование функций

## Горячие клавиши
\`Ctrl + Shift + P\` — Командная палитра VS Code
\`Alt + ↑ / ↓\` — Переместить строку вверх/вниз
\`Ctrl + D\` — Выбрать следующее вхождение
\`Ctrl + B\` — Скрыть боковую панель`,
  },
};

