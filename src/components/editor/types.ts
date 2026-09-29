import { DocumentType } from '@/types';

export type ObstacleKind = 'image' | 'quote' | 'badge';

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
}
