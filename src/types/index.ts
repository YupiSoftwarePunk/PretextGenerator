export type DocumentType = 'slide' | 'card' | 'cheatsheet';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

export interface Template {
  id: string;
  name: string;
  type: DocumentType;
  content: string;
  description: string;
  thumbnail?: string;
}

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
}

export interface CheatsheetConfig {
  columns: 1 | 2 | 3;
  fontSize: 'small' | 'medium' | 'large';
  showIndex: boolean;
}

export interface ExportOptions {
  format: 'html' | 'png' | 'pdf' | 'json';
  quality?: number;
  scale?: number;
}

export interface StorageData {
  documents: Document[];
  lastModified: string;
}
