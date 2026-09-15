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
}

export class PretextEngine {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private measurementCache: Map<string, WordMeasurement>;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.context = ctx;
    this.measurementCache = new Map<string, WordMeasurement>();
  }

  /**
   * Generates a cache key from font configuration
   */
  private getFontString(config: FontConfig): string {
    const weight = config.fontWeight || 'normal';
    const style = config.fontStyle || 'normal';
    return `${style} ${weight} ${config.fontSize}px ${config.fontFamily}`;
  }

  /**
   * Generates a unique cache key for a word with specific font config
   */
  private getCacheKey(word: string, fontString: string): string {
    return `${fontString}::${word}`;
  }

  /**
   * Measures a single word with the given font configuration
   */
  private measureWord(word: string, fontString: string): WordMeasurement {
    const cacheKey = this.getCacheKey(word, fontString);

    // Check cache first
    const cached = this.measurementCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Measure the word
    this.context.font = fontString;
    const metrics = this.context.measureText(word);

    // Calculate height from font metrics
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const measurement: WordMeasurement = {
      word,
      width: metrics.width,
      height
    };

    // Cache the measurement
    this.measurementCache.set(cacheKey, measurement);

    return measurement;
  }

  /**
   * Prepare phase: measures all words in the text content
   * @param text - The text content to measure
   * @param fontConfig - Font configuration for measurements
   * @returns Array of word measurements
   */
  public prepare(text: string, fontConfig: FontConfig): WordMeasurement[] {
    const fontString = this.getFontString(fontConfig);

    // Split text into words (split by whitespace)
    const words = text.split(/\s+/).filter(word => word.length > 0);

    // Measure each word
    return words.map(word => this.measureWord(word, fontString));
  }

  /**
   * Clears the measurement cache
   */
  public clearCache(): void {
    this.measurementCache.clear();
  }

  /**
   * Gets the current cache size
   */
  public getCacheSize(): number {
    return this.measurementCache.size;
  }
}
