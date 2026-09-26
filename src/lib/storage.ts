import { useEffect, useRef, useState, useCallback } from 'react';
import { Document, DocumentType } from '@/types';
import { PretextObstacle } from '@/components/editor/types';

export const STORAGE_KEY_DOCS = 'pretext_docs';
export const STORAGE_KEY_ACTIVE = 'pretext_active_doc';
export const STORAGE_EVENT = 'pretext_storage_changed';

export interface SaveDocumentInput {
  id?: string;
  type: DocumentType;
  title?: string;
  content: string;
  templateId?: string;
  obstacles?: PretextObstacle[];
}

export interface BackupData {
  version: string;
  exportedAt: string;
  documents: Document[];
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Trigger storage change event across the application
 */
function notifyStorageChange() {
  cachedDocsRaw = null;
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(STORAGE_EVENT));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to dispatch storage event', e);
  }
}

let cachedDocsRaw: string | null = null;
let cachedDocsResult: Document[] = [];

/**
 * Get all stored documents from LocalStorage (cached to satisfy useSyncExternalStore reference stability)
 */
export function getDocuments(): Document[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS) || '[]';
    if (raw === cachedDocsRaw) {
      return cachedDocsResult;
    }
    cachedDocsRaw = raw;
    const parsed = JSON.parse(raw);
    cachedDocsResult = Array.isArray(parsed) ? parsed : [];
    return cachedDocsResult;
  } catch (e) {
    console.error('Failed to parse documents from localStorage', e);
    return cachedDocsResult;
  }
}

/**
 * Find document by ID
 */
export function getDocumentById(id: string): Document | undefined {
  const docs = getDocuments();
  return docs.find((doc) => doc.id === id);
}

/**
 * Save a document. If document with given id already exists, update it.
 * Otherwise, generate a new id and prepend to list.
 */
export function saveDocument(input: SaveDocumentInput): Document {
  if (typeof window === 'undefined') {
    throw new Error('saveDocument can only be called in browser environment');
  }

  const existingDocs = getDocuments();
  const now = new Date().toISOString();

  let targetId = input.id;
  let isUpdate = false;

  if (targetId) {
    const existingIndex = existingDocs.findIndex((d) => d.id === targetId);
    if (existingIndex !== -1) {
      isUpdate = true;
      const updatedDoc: Document = {
        ...existingDocs[existingIndex],
        type: input.type,
        title: input.title || existingDocs[existingIndex].title,
        content: input.content,
        obstacles: input.obstacles ?? existingDocs[existingIndex].obstacles,
        templateId: input.templateId ?? existingDocs[existingIndex].templateId,
        updatedAt: now,
      };

      existingDocs[existingIndex] = updatedDoc;
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(existingDocs));
      notifyStorageChange();
      return updatedDoc;
    }
  }

  // Create new document
  if (!targetId) {
    targetId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const newDoc: Document = {
    id: targetId,
    type: input.type,
    title: input.title || `${input.type.toUpperCase()} — ${new Date().toLocaleDateString('ru-RU')}`,
    content: input.content,
    createdAt: now,
    updatedAt: now,
    templateId: input.templateId,
    obstacles: input.obstacles,
  };

  const updatedDocs = [newDoc, ...existingDocs];
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updatedDocs));
  notifyStorageChange();
  return newDoc;
}

/**
 * Update an existing document partially
 */
export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  if (typeof window === 'undefined') return null;

  const existingDocs = getDocuments();
  const index = existingDocs.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const updatedDoc: Document = {
    ...existingDocs[index],
    ...updates,
    id, // protect id from being changed
    updatedAt: new Date().toISOString(),
  };

  existingDocs[index] = updatedDoc;
  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(existingDocs));
  notifyStorageChange();
  return updatedDoc;
}

/**
 * Delete a document by ID
 */
export function deleteDocument(id: string): boolean {
  if (typeof window === 'undefined') return false;

  const existingDocs = getDocuments();
  const filtered = existingDocs.filter((d) => d.id !== id);

  if (filtered.length === existingDocs.length) return false;

  localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(filtered));
  notifyStorageChange();
  return true;
}

/**
 * Export all documents to a JSON string backup
 */
export function exportBackupJSON(): string {
  const docs = getDocuments();
  const backup: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    documents: docs,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Import documents from a backup JSON string
 */
export function importBackupJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, error: 'Browser environment required' };
  }

  try {
    const data = JSON.parse(jsonString);
    const incomingDocs: Document[] = Array.isArray(data)
      ? data
      : Array.isArray(data.documents)
      ? data.documents
      : [];

    if (incomingDocs.length === 0) {
      return { success: false, count: 0, error: 'В файле не найдено корректных документов' };
    }

    const currentDocs = getDocuments();
    const docMap = new Map<string, Document>();

    currentDocs.forEach((d) => docMap.set(d.id, d));

    let importedCount = 0;
    incomingDocs.forEach((d) => {
      if (d.id && d.title && d.content && d.type) {
        docMap.set(d.id, {
          ...d,
          updatedAt: d.updatedAt || new Date().toISOString(),
        });
        importedCount++;
      }
    });

    const merged = Array.from(docMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(merged));
    notifyStorageChange();

    return { success: true, count: importedCount };
  } catch (err: any) {
    console.error('Failed to import backup JSON', err);
    return { success: false, count: 0, error: err?.message || 'Неверный формат JSON' };
  }
}

/**
 * Active document operations (used when navigating between Studio & Gallery)
 */
export function getActiveDocument(): Partial<Document> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read active document', e);
    return null;
  }
}

export function setActiveDocument(doc: Partial<Document>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(doc));
  } catch (e) {
    console.error('Failed to set active document', e);
  }
}

export function clearActiveDocument(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  } catch (e) {
    console.error('Failed to clear active document', e);
  }
}

/**
 * Subscribe to storage changes (compatible with useSyncExternalStore)
 */
export function subscribeToDocuments(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener('focus', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener('focus', callback);
  };
}

/**
 * Debounced AutoSave hook for documents in Studio/Editor
 */
export interface UseAutoSaveOptions {
  docId?: string;
  type: DocumentType;
  title?: string;
  content: string;
  obstacles?: PretextObstacle[];
  enabled?: boolean;
  debounceMs?: number;
  onSaved?: (doc: Document) => void;
}

export function useAutoSave({
  docId,
  type,
  title,
  content,
  obstacles,
  enabled = true,
  debounceMs = 1200,
  onSaved,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [currentId, setCurrentId] = useState<string | undefined>(docId);

  const initialMountRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPayloadRef = useRef<string>('');

  // Sync docId if changed externally
  useEffect(() => {
    if (docId !== undefined) {
      setCurrentId(docId);
    }
  }, [docId]);

  const save = useCallback(
    (immediate = false) => {
      if (!enabled) return null;

      try {
        setStatus('saving');

        const saved = saveDocument({
          id: currentId,
          type,
          title,
          content,
          obstacles,
        });

        setCurrentId(saved.id);
        setLastSavedAt(new Date());
        setStatus('saved');

        if (onSaved) {
          onSaved(saved);
        }

        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2500);

        return saved;
      } catch (e) {
        console.error('AutoSave failed', e);
        setStatus('error');
        return null;
      }
    },
    [currentId, type, title, content, obstacles, enabled, onSaved]
  );

  useEffect(() => {
    // Avoid auto-saving immediately on initial mount
    if (initialMountRef.current) {
      initialMountRef.current = false;
      lastSavedPayloadRef.current = JSON.stringify({ type, title, content, obstacles });
      return;
    }

    if (!enabled) return;

    const currentPayload = JSON.stringify({ type, title, content, obstacles });
    if (currentPayload === lastSavedPayloadRef.current) {
      return;
    }

    setStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      lastSavedPayloadRef.current = currentPayload;
      save(false);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [type, title, content, obstacles, enabled, debounceMs, save]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  return {
    status,
    lastSavedAt,
    currentDocId: currentId,
    saveNow: () => save(true),
  };
}
