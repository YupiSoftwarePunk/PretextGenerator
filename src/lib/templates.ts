import { Template, DocumentType } from '@/types';

export const templates: Template[] = [
  // СЛАЙДЫ
  {
    id: 'slide-minimal',
    name: 'Минималистичная презентация',
    type: 'slide',
    description: 'Чистый дизайн с акцентом на контент',
    content: `# Заголовок слайда

> Основная мысль презентации

## Ключевые пункты
- Простота и ясность
- Визуальная иерархия
- Минимум текста

---

# Второй слайд

Контент второго слайда с *акцентами* и **важными словами**.`,
    thumbnail: '/templates/slide-minimal.svg',
  },
  {
    id: 'slide-tech',
    name: 'Техническая презентация',
    type: 'slide',
    description: 'Для технических докладов и код-ревью',
    content: `# API Architecture

## Stack
- Next.js 16 (App Router)
- TypeScript
- Pretext

\`\`\`typescript
export async function GET(request: Request) {
  return Response.json({ status: 'ok' })
}
\`\`\`

---

# Performance Metrics

> Результаты нагрузочного тестирования

| Метрика | Значение |
|---------|----------|
| RPS     | 10,000   |
| Latency | 45ms     |`,
    thumbnail: '/templates/slide-tech.svg',
  },
  {
    id: 'slide-startup',
    name: 'Pitch Deck',
    type: 'slide',
    description: 'Для стартап-презентаций и питчей',
    content: `# 🚀 Startup Name

> Solving [problem] for [audience]

---

# The Problem

- Pain point 1
- Pain point 2
- Pain point 3

---

# Our Solution

革命性ный подход к решению проблемы

---

# Market Size

**$10B** TAM
**$2B** SAM
**$500M** SOM`,
    thumbnail: '/templates/slide-startup.svg',
  },

  // КАРТОЧКИ
  {
    id: 'card-vocab',
    name: 'Карточки для изучения слов',
    type: 'card',
    description: 'Флэшкарды для запоминания терминов',
    content: `# Recursion

**Определение:**
Функция, которая вызывает сама себя

**Пример:**
\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
\`\`\`

---

# Closure

**Определение:**
Функция с доступом к внешней области видимости

**Пример:**
\`\`\`js
function outer() {
  let count = 0;
  return () => ++count;
}
\`\`\``,
    thumbnail: '/templates/card-vocab.svg',
  },
  {
    id: 'card-interview',
    name: 'Вопросы для собеседований',
    type: 'card',
    description: 'Подготовка к техническим интервью',
    content: `# Что такое Virtual DOM?

**Ответ:**
Легковесная копия реального DOM в памяти.
React сравнивает Virtual DOM со снапшотом и применяет только изменения.

**Преимущества:**
- Быстрее прямых манипуляций с DOM
- Batch updates
- Cross-platform (React Native)

---

# Event Loop в JavaScript

**Ответ:**
Механизм обработки асинхронных операций.

**Компоненты:**
1. Call Stack
2. Web APIs
3. Callback Queue
4. Event Loop`,
    thumbnail: '/templates/card-interview.svg',
  },
  {
    id: 'card-quick',
    name: 'Быстрые заметки',
    type: 'card',
    description: 'Для записи идей и мыслей',
    content: `# Идея для проекта

> AI-powered code review tool

**Фичи:**
- Автоматический анализ PR
- Suggestions на базе best practices
- Integration с GitHub/GitLab

**Stack:**
TypeScript, Anthropic API, Vercel

---

# Meeting Notes

**Дата:** 2026-09-16
**Участники:** Team Lead, 2 разработчика

**Решения:**
- Переход на монорепо
- Внедрение Turborepo
- Code freeze с 20.09`,
    thumbnail: '/templates/card-quick.svg',
  },

  // ШПАРГАЛКИ
  {
    id: 'cheat-git',
    name: 'Git команды',
    type: 'cheatsheet',
    description: 'Основные команды Git',
    content: `# Git Cheatsheet

## Базовые команды
\`git init\` — инициализация репозитория
\`git clone <url>\` — клонирование
\`git status\` — статус файлов
\`git add .\` — добавить все файлы
\`git commit -m "msg"\` — коммит

## Ветки
\`git branch\` — список веток
\`git branch <name>\` — создать ветку
\`git checkout <name>\` — переключиться
\`git merge <branch>\` — слияние

## Удаленные репозитории
\`git remote add origin <url>\` — добавить remote
\`git push -u origin main\` — первый push
\`git pull\` — получить изменения
\`git fetch\` — загрузить без слияния

## Отмена изменений
\`git reset HEAD~1\` — отменить последний коммит
\`git checkout -- <file>\` — сбросить файл
\`git revert <commit>\` — создать обратный коммит`,
    thumbnail: '/templates/cheat-git.svg',
  },
  {
    id: 'cheat-react',
    name: 'React Hooks',
    type: 'cheatsheet',
    description: 'Справочник по хукам React',
    content: `# React Hooks Reference

## useState
\`\`\`jsx
const [count, setCount] = useState(0)
setCount(count + 1)
setCount(prev => prev + 1) // functional update
\`\`\`

## useEffect
\`\`\`jsx
useEffect(() => {
  // side effect
  return () => { /* cleanup */ }
}, [deps])
\`\`\`

## useRef
\`\`\`jsx
const ref = useRef(null)
ref.current // mutable value
\`\`\`

## useCallback
\`\`\`jsx
const memoized = useCallback(() => {
  doSomething(a, b)
}, [a, b])
\`\`\`

## useMemo
\`\`\`jsx
const value = useMemo(() =>
  expensiveCalc(a, b), [a, b]
)
\`\`\`

## useContext
\`\`\`jsx
const value = useContext(MyContext)
\`\`\``,
    thumbnail: '/templates/cheat-react.svg',
  },
  {
    id: 'cheat-shortcuts',
    name: 'Горячие клавиши VS Code',
    type: 'cheatsheet',
    description: 'Productivity shortcuts для VS Code',
    content: `# VS Code Shortcuts

## Редактирование
\`Ctrl+X\` — вырезать строку
\`Ctrl+C\` — копировать строку
\`Alt+↑/↓\` — переместить строку
\`Shift+Alt+↑/↓\` — дублировать строку
\`Ctrl+Shift+K\` — удалить строку

## Навигация
\`Ctrl+P\` — быстрое открытие файла
\`Ctrl+Shift+O\` — перейти к символу
\`Ctrl+G\` — перейти к строке
\`Alt+←/→\` — назад/вперед
\`Ctrl+Tab\` — переключение между файлами

## Поиск
\`Ctrl+F\` — найти
\`Ctrl+H\` — заменить
\`Ctrl+Shift+F\` — поиск в проекте
\`F3 / Shift+F3\` — следующее/предыдущее

## Мультикурсор
\`Alt+Click\` — добавить курсор
\`Ctrl+Alt+↑/↓\` — курсор выше/ниже
\`Ctrl+D\` — выбрать следующее вхождение
\`Ctrl+Shift+L\` — выбрать все вхождения`,
    thumbnail: '/templates/cheat-shortcuts.svg',
  },
];

export function getTemplatesByType(type: DocumentType): Template[] {
  return templates.filter(t => t.type === type);
}

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}
