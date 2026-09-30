import { DocumentType } from '@/types';
import { WordLayoutItem } from '@/lib/PretextEngine';
import { PretextObstacle } from '../types';

const imageCache = new Map<string, HTMLImageElement>();

export function drawObstacleOnCanvas(
  ctx: CanvasRenderingContext2D,
  obs: PretextObstacle,
  isDragging: boolean
) {
  ctx.save();

  if (obs.kind === 'image' && obs.imageSrc) {
    let img = imageCache.get(obs.imageSrc);
    if (!img) {
      img = new Image();
      img.src = obs.imageSrc;
      imageCache.set(obs.imageSrc, img);
    }

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
    ctx.clip();

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
    } else {
      ctx.fillStyle = '#27272a';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Загрузка...', obs.x + obs.width / 2, obs.y + obs.height / 2);
    }
    ctx.restore();

    // Border & Glow
    const borderColor = isDragging ? '#e879f9' : '#c084fc';
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = isDragging ? 22 : 12;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label banner at bottom
    if (obs.label) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(obs.x, obs.y + obs.height - 24, obs.width, 24);
      ctx.font = '600 10px monospace';
      ctx.fillStyle = '#fae8ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height - 12);
    }

    ctx.restore();
    return;
  }

  if (obs.shape === 'circle') {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const r = obs.width / 2;

    // Glow
    ctx.shadowColor = isDragging ? '#e879f9' : '#c084fc';
    ctx.shadowBlur = isDragging ? 24 : 14;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isDragging ? 'rgba(168,85,247,0.38)' : 'rgba(139,92,246,0.22)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDragging ? '#e879f9' : '#c084fc';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Icon label
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#fae8ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obs.kind === 'image' ? '🖼' : obs.kind === 'quote' ? '💬' : '⚡', cx, cy - 10);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = '#d8b4fe';
    ctx.fillText(obs.label, cx, cy + 10);

  } else {
    // Rounded rect obstacle
    const borderColor = obs.kind === 'badge'
      ? (isDragging ? '#fbbf24' : '#f59e0b')
      : obs.kind === 'quote'
        ? (isDragging ? '#67e8f9' : '#22d3ee')
        : (isDragging ? '#86efac' : '#4ade80');

    const fillColor = obs.kind === 'badge'
      ? (isDragging ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.18)')
      : obs.kind === 'quote'
        ? (isDragging ? 'rgba(6,182,212,0.38)' : 'rgba(6,182,212,0.18)')
        : (isDragging ? 'rgba(74,222,128,0.35)' : 'rgba(74,222,128,0.18)');

    ctx.shadowColor = borderColor;
    ctx.shadowBlur = isDragging ? 22 : 12;

    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner content by kind
    const icon = obs.kind === 'badge' ? '⚡' : obs.kind === 'quote' ? '💬' : '🖼';
    ctx.font = 'bold 16px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, obs.x + obs.width / 2, obs.y + obs.height / 2 - 10);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = borderColor;
    ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height / 2 + 12);
  }

  ctx.restore();
}

export function buildExportHTML(
  docType: DocumentType,
  content: string,
  layoutItems: WordLayoutItem[],
  obstacles: PretextObstacle[],
  canvasWidth: number,
  canvasHeight: number
): string {
  const obstacleHtml = obstacles.map((obs) => {
    if (obs.kind === 'image' && obs.imageSrc) {
      return `<div style="position: absolute; left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; background: #18181b; border: 1.5px solid #c084fc; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(192,132,252,0.3); display: flex; flex-direction: column;">
        <img src="${obs.imageSrc}" style="width: 100%; height: calc(100% - 24px); object-fit: cover;" />
        <div style="height: 24px; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px; color: #fae8ff; font-weight: bold; padding: 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${obs.label}</div>
      </div>`;
    }

    const bg = obs.shape === 'circle'
      ? 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.1) 100%)'
      : obs.kind === 'badge'
        ? 'rgba(245,158,11,0.2)'
        : obs.kind === 'quote'
          ? 'rgba(6,182,212,0.2)'
          : 'rgba(139,92,246,0.2)';
    const border = obs.kind === 'badge' ? '#f59e0b' : obs.kind === 'quote' ? '#22d3ee' : '#c084fc';
    const icon = obs.kind === 'image' ? '🖼' : obs.kind === 'quote' ? '💬' : '⚡';
    const radius = obs.shape === 'circle' ? '50%' : '12px';

    return `<div style="position: absolute; left: ${obs.x}px; top: ${obs.y}px; width: ${obs.width}px; height: ${obs.height}px; background: ${bg}; border: 1.5px solid ${border}; border-radius: ${radius}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 20px ${border}40; backdrop-filter: blur(4px); color: #fff; font-family: monospace; text-align: center; padding: 8px;">
      <div style="font-size: 16px; margin-bottom: 4px;">${icon}</div>
      <div style="font-size: 10px; font-weight: bold; color: ${border};">${obs.label}</div>
    </div>`;
  }).join('\n');

  const wordSpans = layoutItems
    .map(
      (item) =>
        `<span style="position:absolute;left:${item.x}px;top:${item.y - 15}px;white-space:nowrap;font-size:15px;color:#e4e4e7;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${item.word}</span>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Pretext Export — ${docType.toUpperCase()}</title>
  <style>
    body { background: #09090b; margin: 0; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .export-container { width: 100%; max-width: ${canvasWidth}px; background: #18181b; border: 1px solid rgba(139,92,246,0.4); border-radius: 24px; padding: 24px; box-shadow: 0 0 50px rgba(139,92,246,0.25); }
    .stage { position: relative; width: 100%; height: ${canvasHeight}px; background: rgba(24,24,27,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .words { position: absolute; inset: 0; }
  </style>
</head>
<body>
  <div class="export-container">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span style="font-family: monospace; font-size: 12px; color: #a78bfa; background: rgba(139,92,246,0.2); padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-weight: bold;">${docType}</span>
      <span style="font-family: monospace; font-size: 12px; color: #71717a;">Pretext Engine Export</span>
    </div>
    <div class="stage">
      <div class="words">${wordSpans}</div>
      ${obstacleHtml}
    </div>
  </div>
</body>
</html>`;
}
