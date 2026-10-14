import jsPDF from 'jspdf';
import { DocumentType } from '@/types';
import { PretextEngine, WordLayoutItem } from '@/lib/PretextEngine';
import { PretextObstacle } from '@/components/editor/types';
import { THEME_COLORS, getObstacleIcon, drawObstacleOnCanvas } from '@/components/editor/utils/canvasUtils';

export interface BaseExportOptions {
  title?: string;
  docType: DocumentType;
  fileName?: string;
  gap?: number;
  containerWidth?: number;
  containerHeight?: number;
}

export interface ExportPNGOptions extends BaseExportOptions {
  content: string;
  obstacles?: PretextObstacle[];
  scale?: 1 | 2 | 4; // 1x standard, 2x retina, 4x ultra/print
  canvas?: HTMLCanvasElement | null;
  theme?: 'dark' | 'light';
}

export interface ExportHTMLOptions extends BaseExportOptions {
  content: string;
  obstacles?: PretextObstacle[];
}

export interface ExportPDFOptions extends BaseExportOptions {
  content: string;
  obstacles?: PretextObstacle[];
  allSlides?: boolean;
  scale?: number;
  twoSidedPrint?: boolean;
}

/**
 * Trigger file download from a Blob
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger file download from a Data URL
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  if (typeof window === 'undefined') return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Helper to render Pretext layout on a canvas
 */
export function renderPretextToCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number;
    height: number;
    scale: number;
    text: string;
    obstacles: PretextObstacle[];
    gap: number;
    theme?: 'dark' | 'light';
  }
): void {
  const { width, height, scale, text, obstacles, gap, theme = 'dark' } = options;

  ctx.save();
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = theme === 'dark' ? '#09090b' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Layout calculation
  const engine = new PretextEngine({
    containerWidth: width,
    fontSize: 15,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 26,
  });

  const layoutItems: WordLayoutItem[] = engine.calculateWordLayout(text, obstacles, gap);

  // Text render
  ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme === 'dark' ? '#e4e4e7' : '#111827';
  ctx.textBaseline = 'alphabetic';

  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    ctx.fillText(item.word, item.x, item.y);
  }

  // Obstacles render
  obstacles.forEach((obs) => {
    drawObstacleOnCanvas(ctx, obs, false);
  });

  ctx.restore();
}

/**
 * Export Pretext Document to PNG (supports 1x, 2x Retina, 4x Print)
 */
export async function exportToPNG(options: ExportPNGOptions): Promise<void> {
  const {
    content,
    obstacles = [],
    gap = 14,
    containerWidth = 600,
    containerHeight = 420,
    scale = 2,
    fileName = `pretext_${options.docType}_${scale}x_${Date.now()}.png`,
    theme = 'dark',
    canvas: sourceCanvas,
  } = options;

  // If a source canvas is passed and scale is 1, export directly
  if (sourceCanvas && scale === 1) {
    const dataUrl = sourceCanvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, fileName);
    return;
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = containerWidth * scale;
  exportCanvas.height = containerHeight * scale;

  const ctx = exportCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed for PNG export');
  }

  renderPretextToCanvas(ctx, {
    width: containerWidth,
    height: containerHeight,
    scale,
    text: content,
    obstacles,
    gap,
    theme,
  });

  const dataUrl = exportCanvas.toDataURL('image/png');
  downloadDataUrl(dataUrl, fileName);
}

/**
 * Export standalone clean HTML with inline CSS and sticker obstacles
 */
export function exportToHTML(options: ExportHTMLOptions): void {
  const {
    docType,
    title = 'Pretext Document',
    content,
    obstacles = [],
    gap = 14,
    containerWidth = 680,
    containerHeight = 440,
    fileName = `pretext_${docType}_${Date.now()}.html`,
  } = options;

  const engine = new PretextEngine({
    containerWidth,
    fontSize: 15,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 26,
  });

  const layoutItems = engine.calculateWordLayout(content, obstacles, gap);

  const obstacleHtml = obstacles
    .map((obs) => {
      const themeKey = obs.theme || (obs.kind === 'badge' ? 'amber' : obs.kind === 'quote' ? 'cyan' : 'violet');
      const defaultTheme = THEME_COLORS[themeKey] || THEME_COLORS.violet;
      const borderColor = obs.borderColor || defaultTheme.border;
      const fillColor = obs.fillColor || defaultTheme.fill;
      const textColor = obs.textColor || defaultTheme.text;
      const isCircle = obs.shape === 'circle';
      const radius = isCircle ? '50%' : '14px';

      if (obs.kind === 'image' && obs.imageSrc) {
        return `      <div class="obstacle obstacle-image" style="left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; border-color: ${borderColor}; box-shadow: 0 0 25px ${borderColor}35;">
        <img src="${obs.imageSrc}" alt="${obs.label || 'Image'}" style="width: 100%; height: calc(100% - 24px); object-fit: cover;" />
        <div class="obstacle-label" style="color: ${textColor};">${obs.label}</div>
      </div>`;
      }

      return `      <div class="obstacle obstacle-sticker" style="left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; background: ${fillColor}; border-color: ${borderColor}; border-radius: ${radius}; box-shadow: 0 0 25px ${borderColor}35; color: ${textColor};">
        <div class="obstacle-icon">${getObstacleIcon(obs.kind)}</div>
        <div class="obstacle-text">${obs.label}</div>
        ${obs.sublabel ? `<div class="obstacle-sublabel">${obs.sublabel}</div>` : ''}
      </div>`;
    })
    .join('\n');

  const wordSpans = layoutItems
    .map(
      (item) =>
        `      <span class="word" style="left: ${item.x}px; top: ${item.y - 15}px;">${item.word}</span>`
    )
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Pretext Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090b;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }
    .wrapper {
      width: 100%;
      max-width: ${containerWidth + 48}px;
      background: rgba(24, 24, 27, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15);
      backdrop-filter: blur(16px);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c084fc;
    }
    .meta {
      font-family: monospace;
      font-size: 11px;
      color: #71717a;
    }
    .canvas-stage {
      position: relative;
      width: 100%;
      height: ${containerHeight}px;
      background: #111114;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      overflow: hidden;
    }
    .word {
      position: absolute;
      white-space: nowrap;
      font-size: 15px;
      line-height: 26px;
      color: #e4e4e7;
    }
    .obstacle {
      position: absolute;
      border-width: 1.5px;
      border-style: solid;
      backdrop-filter: blur(8px);
      z-index: 10;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8px;
    }
    .obstacle-image {
      background: #18181b;
      padding: 0;
      border-radius: 12px;
    }
    .obstacle-label {
      height: 24px;
      width: 100%;
      background: rgba(0, 0, 0, 0.8);
      font-family: monospace;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .obstacle-icon {
      font-size: 18px;
      margin-bottom: 4px;
    }
    .obstacle-text {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
    }
    .obstacle-sublabel {
      font-family: monospace;
      font-size: 9px;
      color: #a1a1aa;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">${docType}</div>
      <div class="meta">Pretext Autonomous Export</div>
    </div>
    <div class="canvas-stage">
${wordSpans}
${obstacleHtml}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  downloadBlob(blob, fileName);
}

/**
 * Export entire presentation (all slides) into a multi-page PDF document
 */
export async function exportSlidesToPDF(options: ExportPDFOptions): Promise<void> {
  const {
    content,
    obstacles = [],
    gap = 14,
    containerWidth = 720,
    containerHeight = 440,
    fileName = `pretext_presentation_${Date.now()}.pdf`,
  } = options;

  const slides = content.split(/\n---\s*\n/);
  const totalSlides = Math.max(1, slides.length);

  const pdf = new jsPDF({
    orientation: containerWidth > containerHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [containerWidth, containerHeight],
  });

  const exportCanvas = document.createElement('canvas');
  const dpr = 2; // High-DPI for crisp text render
  exportCanvas.width = containerWidth * dpr;
  exportCanvas.height = containerHeight * dpr;

  const ctx = exportCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context creation failed for PDF export');
  }

  for (let i = 0; i < totalSlides; i++) {
    const slideText = slides[i] || '';

    // Filter obstacles for current slide (or shared obstacles)
    const slideObstacles = obstacles.filter(
      (obs) => obs.slideIndex === undefined || obs.slideIndex === i
    );

    ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

    renderPretextToCanvas(ctx, {
      width: containerWidth,
      height: containerHeight,
      scale: dpr,
      text: slideText,
      obstacles: slideObstacles,
      gap,
      theme: 'light', // Clean white background for PDF print
    });

    // Draw slide counter in footer
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.fillText(`Слайд ${i + 1} из ${totalSlides}`, containerWidth - 24, containerHeight - 16);
    ctx.restore();

    const imgData = exportCanvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage([containerWidth, containerHeight], containerWidth > containerHeight ? 'landscape' : 'portrait');
    }

    pdf.addImage(imgData, 'PNG', 0, 0, containerWidth, containerHeight);
  }

  pdf.save(fileName);
}

/**
 * Export flashcards into a 2-sided print-ready layout (Front & Back alignment)
 */
export async function exportFlashcardsToPrintPDF(options: ExportPDFOptions): Promise<void> {
  const {
    content,
    obstacles = [],
    gap = 14,
    fileName = `pretext_flashcards_print_${Date.now()}.pdf`,
  } = options;

  // Split front and back
  const parts = content.split('=== BACK ===');
  const frontContent = (parts[0] || '').trim();
  const backContent = (parts[1] || '').trim();

  // A4 dimensions in px at 96 DPI: 794 x 1123 (portrait) or landscape: 1123 x 794
  const a4Width = 842;
  const a4Height = 595; // A4 Landscape

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [a4Width, a4Height],
  });

  const cardWidth = 520;
  const cardHeight = 340;
  const cardX = (a4Width - cardWidth) / 2;
  const cardY = (a4Height - cardHeight) / 2;

  const exportCanvas = document.createElement('canvas');
  const dpr = 2;
  exportCanvas.width = a4Width * dpr;
  exportCanvas.height = a4Height * dpr;

  const ctx = exportCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context creation failed for Flashcards PDF export');
  }

  const renderCardSheet = (
    side: 'front' | 'back',
    text: string,
    sideLabel: string
  ) => {
    ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    // Sheet background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, a4Width, a4Height);

    // Header sheet info
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText(`PRETEXT FLASHCARD PRINT SHEET — ${sideLabel.toUpperCase()}`, 36, 32);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Линия реза отмечена пунктиром. Переверните лист при печати для совпадения сторон.', 36, 48);

    // Card outline (cut lines)
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
    ctx.restore();

    // Card White Body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2);

    // Top Card Accent Banner
    ctx.fillStyle = side === 'front' ? '#7c3aed' : '#0891b2';
    ctx.fillRect(cardX, cardY, cardWidth, 6);

    // Card Side Tag
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = side === 'front' ? '#7c3aed' : '#0891b2';
    ctx.textAlign = 'right';
    ctx.fillText(side === 'front' ? '★ ЛИЦЕВАЯ СТОРОНА (FRONT)' : '✪ ОБРАТНАЯ СТОРОНА (BACK)', cardX + cardWidth - 16, cardY + 24);

    // Card text & obstacles layout
    const sideObstacles = obstacles.filter(
      (o) => !o.cardSide || o.cardSide === 'both' || o.cardSide === side
    );

    const innerPadding = 24;
    const innerWidth = cardWidth - innerPadding * 2;
    const engine = new PretextEngine({
      containerWidth: innerWidth,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 24,
    });

    const layoutItems = engine.calculateWordLayout(text, sideObstacles, gap);

    ctx.save();
    ctx.translate(cardX + innerPadding, cardY + 40);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textBaseline = 'alphabetic';

    for (let i = 0; i < layoutItems.length; i++) {
      const item = layoutItems[i];
      ctx.fillText(item.word, item.x, item.y);
    }

    sideObstacles.forEach((obs) => {
      drawObstacleOnCanvas(ctx, obs, false);
    });

    ctx.restore();
    ctx.restore();
  };

  // 1. Render Front Side (Page 1)
  renderCardSheet('front', frontContent, 'Лицевая сторона');
  const frontImg = exportCanvas.toDataURL('image/png');
  pdf.addImage(frontImg, 'PNG', 0, 0, a4Width, a4Height);

  // 2. Render Back Side (Page 2)
  pdf.addPage([a4Width, a4Height], 'landscape');
  renderCardSheet('back', backContent, 'Обратная сторона');
  const backImg = exportCanvas.toDataURL('image/png');
  pdf.addImage(backImg, 'PNG', 0, 0, a4Width, a4Height);

  pdf.save(fileName);
}
