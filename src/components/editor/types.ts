import { DocumentType } from '@/types';

export type ObstacleKind = 'image' | 'quote' | 'badge';
export type ObstacleTheme = 'violet' | 'emerald' | 'amber' | 'cyan' | 'dark' | 'neon';

export interface PretextObstacle {
  id: string;
  kind: ObstacleKind;
  label: string;
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
}
