import { Document, StorageData } from '@/types';

const STORAGE_KEY = 'pretext_documents';

export const storage = {
  getAll(): Document[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed: StorageData = JSON.parse(data);
      return parsed.documents || [];
    } catch (error) {
      console.error('Failed to load documents:', error);
      return [];
    }
  },

  getById(id: string): Document | null {
    const documents = this.getAll();
    return documents.find(doc => doc.id === id) || null;
  },

  save(document: Document): void {
    const documents = this.getAll();
    const index = documents.findIndex(doc => doc.id === document.id);

    if (index >= 0) {
      documents[index] = { ...document, updatedAt: new Date().toISOString() };
    } else {
      documents.push(document);
    }

    const data: StorageData = {
      documents,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  delete(id: string): void {
    const documents = this.getAll().filter(doc => doc.id !== id);
    const data: StorageData = {
      documents,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
