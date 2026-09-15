import { ExportOptions } from '@/components/modals/ExportModal';

export async function exportContent(
  contentElement: HTMLElement,
  filename: string,
  options: ExportOptions
): Promise<void> {
  const { format, scale, quality, transparentBackground } = options;

  switch (format) {
    case 'html':
      await exportHTML(contentElement, filename);
      break;
    case 'svg':
      await exportSVG(contentElement, filename);
      break;
    case 'png':
      await exportImage(contentElement, filename, 'png', scale, quality, transparentBackground);
      break;
    case 'webp':
      await exportImage(contentElement, filename, 'webp', scale, quality, transparentBackground);
      break;
    case 'pdf':
      await exportPDF(contentElement, filename, scale);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function exportHTML(element: HTMLElement, filename: string): Promise<void> {
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
    .pretext-content h1 { font-size: 2rem; font-weight: bold; color: #fff; margin-bottom: 1rem; }
    .pretext-content h2 { font-size: 1.5rem; font-weight: bold; color: #fff; margin-bottom: 0.75rem; }
    .pretext-content h3 { font-size: 1.25rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
    .pretext-content p { color: #D4D4D8; margin: 0.75rem 0; }
    .pretext-content blockquote {
      border-left: 4px solid #8B5CF6;
      padding: 0.5rem 1rem;
      color: #D4D4D8;
      font-style: italic;
      margin: 1rem 0;
    }
    .pretext-content ul { list-style: disc; margin-left: 1.5rem; margin: 1rem 0; }
    .pretext-content li { color: #D4D4D8; margin: 0.5rem 0; }
    .pretext-content strong { font-weight: bold; color: #fff; }
    .pretext-content em { font-style: italic; color: #E4E4E7; }
    .pretext-content code {
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      background: #27272A;
      color: #06B6D4;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
    .pretext-content pre {
      background: #18181B;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
      overflow-x: auto;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .pretext-content pre code {
      background: none;
      padding: 0;
      color: #D4D4D8;
    }
    .pretext-content hr {
      border: none;
      border-top: 2px solid rgba(255,255,255,0.1);
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  <div class="pretext-content">
    ${element.innerHTML}
  </div>
</body>
</html>`;

  downloadFile(html, `${filename}.html`, 'text/html');
}

async function exportSVG(element: HTMLElement, filename: string): Promise<void> {
  const bounds = element.getBoundingClientRect();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #09090B;
      color: #FAFAFA;
      padding: 2rem;
    ">
      ${element.innerHTML}
    </div>
  </foreignObject>
</svg>`;

  downloadFile(svg, `${filename}.svg`, 'image/svg+xml');
}

async function exportImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'webp',
  scale: number,
  quality: number,
  transparentBackground: boolean
): Promise<void> {
  // Динамический импорт html2canvas только когда нужен
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
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
}

async function exportPDF(element: HTMLElement, filename: string, scale: number): Promise<void> {
  // Динамический импорт jsPDF только когда нужен
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
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
