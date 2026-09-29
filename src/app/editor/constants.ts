import { DocumentType } from '@/types';
import { PretextObstacle } from './types';

export const PRESETS: Record<DocumentType, { obstacles: Omit<PretextObstacle, 'id'>[]; text: string }> = {
  slide: {
    obstacles: [
      {
        x: 280, y: 50, width: 180, height: 130, shape: 'rect', gap: 16,
        kind: 'badge', label: '',
      },
    ],
    text: 'Pretext Engine обеспечивает стабильные 120 FPS при обтекании любых визуальных объектов. Математический расчёт координат выполняется полностью на JavaScript без единого DOM reflow. Текст плавно огибает карточку метрики, сохраняя читаемость и структуру контента даже при динамическом изменении положения препятствия.',
  },
  card: {
    obstacles: [
      {
        x: 170, y: 60, width: 130, height: 130, shape: 'circle', gap: 14,
        kind: 'image', label: '',
      },
    ],
    text: 'Флэшкард с центральной графической иконкой демонстрирует возможности алгоритма Pretext: текст равномерно распределяется вокруг круглого препятствия, создавая натуральное и органичное обтекание. Каждое слово точно позиционируется в пространстве документа.',
  },
  cheatsheet: {
    obstacles: [
      {
        x: 30, y: 80, width: 160, height: 100, shape: 'rect', gap: 12,
        kind: 'quote', label: '',
      },
    ],
    text: 'Шпаргалка со стикером важного замечания. Текст документа автоматически уступает место цитате-стикеру и продолжает поток справа и снизу. Pretext гарантирует что ни одно слово не перекрывает визуальный блок.',
  },
};
