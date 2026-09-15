import { ExportOptions } from '@/components/modals/ExportModal';
import PretextRenderer from '@/components/pretext/PretextRenderer';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

export async function exportContent(
  content: string,
  filename: string,
  options: ExportOptions
): Promise<void> {
  const { format, scale, quality, transparentBackground } = options;

  switch (format) {
    case 'html':
      await exportHTML(content, filename);
      break;
    case 'svg':
      await exportSVG(content, filename);
      break;
    case 'png':
      await exportImage(content, filename, 'png', scale, quality, transparentBackground);
      break;
    case 'webp':
      await exportImage(content, filename, 'webp', scale, quality, transparentBackground);
      break;
    case 'pdf':
      await exportPDF(content, filename, scale);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function exportHTML(content: string, filename: string): Promise<void> {
  // Рендерим компонент в статический HTML с exportMode=true
  const markup = renderToStaticMarkup(
    React.createElement(PretextRenderer, { content, exportMode: true })
  );

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pretext Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090B;
      color: #FAFAFA;
      padding: 2rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  ${markup}
</body>
</html>`;

  downloadFile(html, `${filename}.html`, 'text/html');
}

async function exportSVG(content: string, filename: string): Promise<void> {
  const markup = renderToStaticMarkup(
    React.createElement(PretextRenderer, { content, exportMode: true })
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090B;
      color: #FAFAFA;
      padding: 2rem;
    ">
      ${markup}
    </div>
  </foreignObject>
</svg>`;

  downloadFile(svg, `${filename}.svg`, 'image/svg+xml');
}

async function exportImage(
  content: string,
  filename: string,
  format: 'png' | 'webp',
  scale: number,
  quality: number,
  transparentBackground: boolean
): Promise<void> {
  // Создаем временный контейнер с inline стилями (без oklab)
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: 800px;
    padding: 2rem;
    background: ${transparentBackground ? 'transparent' : '#09090B'};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #FAFAFA;
  `;

  // Рендерим с exportMode=true
  const markup = renderToStaticMarkup(
    React.createElement(PretextRenderer, { content, exportMode: true })
  );
  container.innerHTML = markup;
  document.body.appendChild(container);

  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(container, {
      backgroundColor: transparentBackground ? null : '#09090B',
      scale: scale,
      logging: false,
      useCORS: true,
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      `image/${format}`,
      quality / 100
    );
  } finally {
    document.body.removeChild(container);
  }
}

async function exportPDF(content: string, filename: string, scale: number): Promise<void> {
  // Создаем временный контейнер
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -10000px;
    left: -10000px;
    width: 800px;
    padding: 2rem;
    background: #09090B;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #FAFAFA;
  `;

  const markup = renderToStaticMarkup(
    React.createElement(PretextRenderer, { content, exportMode: true })
  );
  container.innerHTML = markup;
  document.body.appendChild(container);

  try {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(container, {
      backgroundColor: '#09090B',
      scale: scale,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
