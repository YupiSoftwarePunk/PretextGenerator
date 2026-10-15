import type { PretextObstacle } from '@/components/editor/types';

export type DocumentType = 'slide' | 'card' | 'cheatsheet';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  obstacles?: PretextObstacle[];
}

export interface Template {
  id: string;
  name: string;
  type: DocumentType;
  content: string;
  description: string;
  thumbnail?: string;
  category?: string;
  featured?: boolean;
}

// ----------------------------------------------------
// Flashcard Models (двухсторонние карточки)
// ----------------------------------------------------
export interface FlashcardItem {
  id: string;
  term: string;
  category: string;
  front: string;
  back: string;
  hint?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  cards: FlashcardItem[];
  activeCardIndex: number;
}

// ----------------------------------------------------
// Slide Models (презентации и слайды)
// ----------------------------------------------------
export interface SlideItem {
  id: string;
  title?: string;
  tag?: string;
  content: string;
  notes?: string;
  layout?: 'default' | 'split' | 'hero' | 'minimal';
}

export interface SlideDeck {
  id: string;
  title: string;
  slides: SlideItem[];
  activeSlideIndex: number;
  aspectRatio: '16:9' | '4:3';
}

// ----------------------------------------------------
// Cheatsheet Models (интерактивные шпаргалки)
// ----------------------------------------------------
export interface CheatsheetItem {
  cmd: string;
  desc: string;
  example?: string;
  category?: string;
}

export interface CheatsheetSection {
  id: string;
  title: string;
  items: CheatsheetItem[];
}

export interface CheatsheetDoc {
  id: string;
  title: string;
  sections: CheatsheetSection[];
  columns: 1 | 2 | 3;
}

// ----------------------------------------------------
// Configuration & Export Options
// ----------------------------------------------------
export interface SlideConfig {
  theme: 'dark' | 'light';
  transition: 'fade' | 'slide' | 'none';
  autoPlay: boolean;
  duration?: number;
}

export interface CardConfig {
  size: 'small' | 'medium' | 'large';
  layout: 'single' | 'grid';
  showBorder: boolean;
  flipAnimation: '3d-flip' | 'fade' | 'slide';
}

export interface CheatsheetConfig {
  columns: 1 | 2 | 3;
  fontSize: 'small' | 'medium' | 'large';
  showIndex: boolean;
  compact: boolean;
}

export interface ExportOptions {
  format: 'html' | 'png' | 'pdf' | 'json' | 'markdown';
  quality?: number;
  scale?: number;
  includeStyles?: boolean;
  twoSidedPrint?: boolean; // Для двухсторонней печати карточек
  allSlides?: boolean;     // Для выгрузки всех слайдов сразу
}

export interface StorageData {
  documents: Document[];
  lastModified: string;
}

