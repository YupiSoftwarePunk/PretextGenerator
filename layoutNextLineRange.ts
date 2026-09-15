export interface Word {
  text: string;
  width: number;
}

export interface Obstacle {
  y: number;
  height: number;
  width: number;
}

export interface LayoutResult {
  line: Word[];
  nextIndex: number;
  width: number;
}

export interface LayoutConfig {
  words: Word[];
  startIndex: number;
  containerWidth: number;
  currentY: number;
  lineHeight: number;
  obstacle?: Obstacle;
  gap?: number;
  spaceWidth: number;
}

export function layoutNextLineRange(config: LayoutConfig): LayoutResult {
  const {
    words,
    startIndex,
    containerWidth,
    currentY,
    lineHeight,
    obstacle,
    gap = 0,
    spaceWidth,
  } = config;

  // Check if current Y position intersects with obstacle
  const intersectsObstacle = obstacle
    ? currentY >= obstacle.y && currentY < obstacle.y + obstacle.height
    : false;

  // Calculate available line width
  const availableWidth = intersectsObstacle && obstacle
    ? containerWidth - obstacle.width - gap
    : containerWidth;

  // Greedily fit words into available width
  const line: Word[] = [];
  let currentWidth = 0;
  let index = startIndex;

  while (index < words.length) {
    const word = words[index];
    const wordWidth = word.width;
    const spaceNeeded = line.length > 0 ? spaceWidth : 0;
    const totalWidth = currentWidth + spaceNeeded + wordWidth;

    if (totalWidth <= availableWidth) {
      line.push(word);
      currentWidth = totalWidth;
      index++;
    } else {
      // Word doesn't fit, stop here
      break;
    }
  }

  return {
    line,
    nextIndex: index,
    width: currentWidth,
  };
}
