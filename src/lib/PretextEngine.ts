export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: 'rect' | 'circle';
  gap?: number;
}

export interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
}

export interface WordLayoutItem {
  word: string;
  x: number;
  y: number;
  width: number;
}

export interface WordMeasurement {
  word: string;
  width: number;
  height: number;
}

export interface FontConfig {
  fontSize: number;
  fontFamily: string;
  fontWeight?: string | number;
  fontStyle?: string;
  lineHeight?: number;
}

export interface EngineConfig {
  containerWidth: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

export interface AvailableRange {
  start: number;
  end: number;
}

export class PretextEngine {
  private config: EngineConfig;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private measurementCache: Map<string, WordMeasurement>;

  constructor(config?: Partial<EngineConfig>) {
    this.config = {
      containerWidth: Math.max(100, config?.containerWidth ?? 800),
      fontSize: config?.fontSize ?? 16,
      fontFamily: config?.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: config?.lineHeight ?? 26,
    };

    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.createElement) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
    } else if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(1, 1);
      this.ctx = this.canvas.getContext('2d')!;
    } else {
      // Fallback for SSR/node environments
      this.canvas = {} as HTMLCanvasElement;
      this.ctx = {
        measureText: (text: string) => ({
          width: text.length * (this.config.fontSize * 0.58),
          actualBoundingBoxAscent: this.config.fontSize * 0.8,
          actualBoundingBoxDescent: this.config.fontSize * 0.2,
        }),
        font: '',
      } as unknown as CanvasRenderingContext2D;
    }

    if (this.ctx && 'font' in this.ctx) {
      this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    }
    this.measurementCache = new Map<string, WordMeasurement>();
  }

  /**
   * Generates a cache key from font configuration
   */
  private getFontString(config: Partial<FontConfig>): string {
    const weight = config.fontWeight || 'normal';
    const style = config.fontStyle || 'normal';
    const size = config.fontSize || this.config.fontSize;
    const family = config.fontFamily || this.config.fontFamily;
    return `${style} ${weight} ${size}px ${family}`;
  }

  /**
   * Measures a single word with the given font configuration
   */
  public measureWord(word: string, fontConfig?: Partial<FontConfig>): WordMeasurement {
    const fontString = fontConfig ? this.getFontString(fontConfig) : `${this.config.fontSize}px ${this.config.fontFamily}`;
    const cacheKey = `${fontString}::${word}`;

    const cached = this.measurementCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (this.ctx && 'font' in this.ctx) {
      this.ctx.font = fontString;
    }

    const metrics = this.ctx.measureText(word);
    const height = (metrics.actualBoundingBoxAscent || this.config.fontSize * 0.8) +
      (metrics.actualBoundingBoxDescent || this.config.fontSize * 0.2);

    const measurement: WordMeasurement = {
      word,
      width: Math.ceil(metrics.width),
      height,
    };

    this.measurementCache.set(cacheKey, measurement);
    return measurement;
  }

  /**
   * Prepare phase: measures all words in the text content
   */
  public prepare(text: string, fontConfig?: Partial<FontConfig>): WordMeasurement[] {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    return words.map((word) => this.measureWord(word, fontConfig));
  }

  /**
   * Calculate exact horizontal ranges avoiding obstacles at vertical slice [lineTop, lineBottom]
   */
  public getAvailableRanges(
    baselineY: number,
    obstacles: Obstacle[],
    defaultGap = 14
  ): AvailableRange[] {
    const occupied: AvailableRange[] = [];
    const containerW = this.config.containerWidth;

    // The line slice covers from top of characters to bottom of descenders
    const lineTop = baselineY - this.config.fontSize;
    const lineBottom = baselineY + 4;

    for (const obstacle of obstacles) {
      const gap = obstacle.gap ?? defaultGap;
      const shape = obstacle.shape ?? 'rect';

      if (shape === 'circle') {
        const radius = Math.max(obstacle.width, obstacle.height) / 2;
        const effectiveR = radius + gap;
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;

        let dyClosest = 0;
        if (centerY < lineTop) {
          dyClosest = lineTop - centerY;
        } else if (centerY > lineBottom) {
          dyClosest = centerY - lineBottom;
        } else {
          dyClosest = 0;
        }

        if (dyClosest <= effectiveR) {
          const horizontalExtent = Math.sqrt(effectiveR * effectiveR - dyClosest * dyClosest);
          const start = Math.max(0, centerX - horizontalExtent);
          const end = Math.min(containerW, centerX + horizontalExtent);
          if (end > start) {
            occupied.push({ start, end });
          }
        }
      } else {
        // Rectangle
        const obsTop = obstacle.y - gap;
        const obsBottom = obstacle.y + obstacle.height + gap;

        // Check if vertical ranges overlap
        if (lineBottom >= obsTop && lineTop <= obsBottom) {
          const start = Math.max(0, obstacle.x - gap);
          const end = Math.min(containerW, obstacle.x + obstacle.width + gap);
          if (end > start) {
            occupied.push({ start, end });
          }
        }
      }
    }

    if (occupied.length === 0) {
      return [{ start: 0, end: containerW }];
    }

    // Sort occupied ranges by start position
    occupied.sort((a, b) => a.start - b.start);

    // Merge overlapping occupied ranges
    const merged: AvailableRange[] = [];
    for (const range of occupied) {
      if (merged.length === 0) {
        merged.push({ ...range });
      } else {
        const last = merged[merged.length - 1];
        if (range.start <= last.end) {
          last.end = Math.max(last.end, range.end);
        } else {
          merged.push({ ...range });
        }
      }
    }

    // Compute free ranges
    const ranges: AvailableRange[] = [];
    let currentX = 0;

    for (const occ of merged) {
      if (occ.start > currentX) {
        const span = occ.start - currentX;
        if (span >= 24) {
          ranges.push({ start: currentX, end: occ.start });
        }
      }
      currentX = Math.max(currentX, occ.end);
    }

    if (currentX < containerW) {
      const span = containerW - currentX;
      if (span >= 24) {
        ranges.push({ start: currentX, end: containerW });
      }
    }

    return ranges.length > 0 ? ranges : [];
  }

  /**
   * Calculate text lines that flow around obstacles
   */
  public calculateLines(content: string, obstacles: Obstacle[], gap = 14): TextLine[] {
    const lines: TextLine[] = [];
    const words = content.split(/\s+/).filter((word) => word.length > 0);

    let currentY = this.config.fontSize + 8;
    let wordIndex = 0;

    while (wordIndex < words.length) {
      const availableRanges = this.getAvailableRanges(currentY, obstacles, gap);

      for (const range of availableRanges) {
        if (wordIndex >= words.length) break;

        const lineResult = this.fitWordsInRange(
          words,
          wordIndex,
          range.start,
          range.end
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
      if (currentY > 20000) break;
    }

    return lines;
  }

  /**
   * Calculate word-level layout for high-performance rendering & animations
   */
  public calculateWordLayout(content: string, obstacles: Obstacle[], gap = 14): WordLayoutItem[] {
    const layoutItems: WordLayoutItem[] = [];
    const words = content.split(/\s+/).filter((w) => w.length > 0);
    const spaceWidth = this.measureWord(' ').width;

    let currentY = this.config.fontSize + 8;
    let wordIndex = 0;

    while (wordIndex < words.length) {
      const availableRanges = this.getAvailableRanges(currentY, obstacles, gap);

      for (const range of availableRanges) {
        if (wordIndex >= words.length) break;

        const availableWidth = range.end - range.start;
        let lineX = range.start;
        let consumedWidth = 0;

        while (wordIndex < words.length) {
          const word = words[wordIndex];
          const wordMeas = this.measureWord(word);
          const isFirst = lineX === range.start;
          const needed = isFirst ? wordMeas.width : spaceWidth + wordMeas.width;

          if (consumedWidth + needed <= availableWidth) {
            const wordX = isFirst ? lineX : lineX + spaceWidth;
            layoutItems.push({
              word,
              x: Math.round(wordX),
              y: Math.round(currentY),
              width: wordMeas.width,
            });
            lineX = wordX + wordMeas.width;
            consumedWidth += needed;
            wordIndex++;
          } else {
            break;
          }
        }
      }

      currentY += this.config.lineHeight;
      if (currentY > 20000) break;
    }

    return layoutItems;
  }

  /**
   * Fit words in horizontal slot
   */
  private fitWordsInRange(
    words: string[],
    startIndex: number,
    rangeStart: number,
    rangeEnd: number
  ): { words: string[]; width: number } {
    const availableWidth = rangeEnd - rangeStart;
    const fittedWords: string[] = [];
    let currentWidth = 0;
    const spaceWidth = this.measureWord(' ').width;

    for (let i = startIndex; i < words.length; i++) {
      const word = words[i];
      const wordWidth = this.measureWord(word).width;
      const neededSpace = fittedWords.length > 0 ? spaceWidth : 0;
      const totalWidth = currentWidth + neededSpace + wordWidth;

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
   * Generate SVG path for neon contour around obstacle
   */
  public static generateContourPath(obstacle: Obstacle, padding = 10): string {
    const shape = obstacle.shape ?? 'rect';

    if (shape === 'circle') {
      const cx = obstacle.x + obstacle.width / 2;
      const cy = obstacle.y + obstacle.height / 2;
      const r = obstacle.width / 2 + padding;
      return `M ${cx - r}, ${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    }

    const x = obstacle.x - padding;
    const y = obstacle.y - padding;
    const w = obstacle.width + padding * 2;
    const h = obstacle.height + padding * 2;
    const r = 10; // border radius

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

  public clearCache(): void {
    this.measurementCache.clear();
  }

  public getCacheSize(): number {
    return this.measurementCache.size;
  }
}
