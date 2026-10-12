import { DocumentType } from '@/types';

export type ObstacleKind = 'image' | 'quote' | 'badge' | 'callout' | 'sticker' | 'metric';
export type ObstacleTheme = 'violet' | 'emerald' | 'amber' | 'cyan' | 'dark' | 'neon' | 'rose' | 'indigo';

export interface PretextObstacle {
  id: string;
  kind: ObstacleKind;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle';
  gap: number;
  imageSrc?: string;
  theme?: ObstacleTheme;
  borderColor?: string;
  fillColor?: string;
  textColor?: string;
  // Контекстная привязка препятствий
  cardSide?: 'front' | 'back' | 'both';
  slideIndex?: number;
  align?: 'left' | 'center' | 'right';
  customCss?: string;
}

export type EditorViewMode = 'flow' | 'formatted' | 'split' | 'presenter';

