export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
}

export interface EngineConfig {
  containerWidth: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

export class PretextEngine {
  private config: EngineConfig;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  constructor(config: EngineConfig) {
    this.config = config;

    // Create canvas for text measurement
    if (typeof window !== 'undefined' && window.document) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    } else {
      this.canvas = new OffscreenCanvas(1, 1);
      this.ctx = this.canvas.getContext('2d')!;
    }

    this.ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  }

  /**
   * Calculate text lines that flow around obstacles
   */
  calculateLines(content: string, obstacles: Obstacle[]): TextLine[] {
    const lines: TextLine[] = [];
    const words = content.split(/\s+/).filter(word => word.length > 0);

    let currentY = this.config.fontSize;
    let wordIndex = 0;

    while (wordIndex < words.length) {
      const availableRanges = this.getAvailableRanges(currentY, obstacles);

      for (const range of availableRanges) {
        if (wordIndex >= words.length) break;

        const lineResult = this.fitWordsInRange(
          words,
          wordIndex,
          range.start,
          range.end,
          currentY
        );

        if (lineResult.words.length > 0) {
          lines.push({
            text: lineResult.words.join(' '),
            x: range.start,
            y: currentY,
            width: lineResult.width,
          });

          wordIndex += lineResult.words.length;
        }
      }

      currentY += this.config.lineHeight;

      // Safety check to prevent infinite loops
      if (currentY > 10000) break;
    }

    return lines;
  }

  /**
   * Get available horizontal ranges at a given Y position, avoiding obstacles
   */
  private getAvailableRanges(y: number, obstacles: Obstacle[]): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    const occupied: Array<{ start: number; end: number }> = [];

    // Find all obstacles that intersect with this line
    for (const obstacle of obstacles) {
      if (y >= obstacle.y && y <= obstacle.y + obstacle.height) {
        occupied.push({
          start: obstacle.x,
          end: obstacle.x + obstacle.width,
        });
      }
    }

    // Sort occupied ranges by start position
    occupied.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    const merged: Array<{ start: number; end: number }> = [];
    for (const range of occupied) {
      if (merged.length === 0) {
        merged.push(range);
      } else {
        const last = merged[merged.length - 1];
        if (range.start <= last.end) {
          last.end = Math.max(last.end, range.end);
        } else {
          merged.push(range);
        }
      }
    }

    // Calculate available ranges
    let currentX = 0;
    for (const occupied of merged) {
      if (currentX < occupied.start) {
        ranges.push({ start: currentX, end: occupied.start });
      }
      currentX = Math.max(currentX, occupied.end);
    }

    // Add remaining space
    if (currentX < this.config.containerWidth) {
      ranges.push({ start: currentX, end: this.config.containerWidth });
    }

    return ranges.length > 0 ? ranges : [{ start: 0, end: this.config.containerWidth }];
  }

  /**
   * Fit as many words as possible in a given horizontal range
   */
  private fitWordsInRange(
    words: string[],
    startIndex: number,
    rangeStart: number,
    rangeEnd: number,
    y: number
  ): { words: string[]; width: number } {
    const availableWidth = rangeEnd - rangeStart;
    const fittedWords: string[] = [];
    let currentWidth = 0;

    for (let i = startIndex; i < words.length; i++) {
      const word = words[i];
      const wordWidth = this.measureText(word);
      const spaceWidth = fittedWords.length > 0 ? this.measureText(' ') : 0;
      const totalWidth = currentWidth + spaceWidth + wordWidth;

      if (totalWidth <= availableWidth) {
        fittedWords.push(word);
        currentWidth = totalWidth;
      } else {
        break;
      }
    }

    return { words: fittedWords, width: currentWidth };
  }

  /**
   * Measure text width using canvas context
   */
  private measureText(text: string): number {
    return this.ctx.measureText(text).width;
  }

  /**
   * Generate SVG path for neon contour around obstacle
   */
  static generateContourPath(obstacle: Obstacle, padding: number = 10): string {
    const x = obstacle.x - padding;
    const y = obstacle.y - padding;
    const w = obstacle.width + padding * 2;
    const h = obstacle.height + padding * 2;
    const r = 8; // border radius

    return `
      M ${x + r} ${y}
      L ${x + w - r} ${y}
      Q ${x + w} ${y} ${x + w} ${y + r}
      L ${x + w} ${y + h - r}
      Q ${x + w} ${y + h} ${x + w - r} ${y + h}
      L ${x + r} ${y + h}
      Q ${x} ${y + h} ${x} ${y + h - r}
      L ${x} ${y + r}
      Q ${x} ${y} ${x + r} ${y}
      Z
    `.trim();
  }
}
