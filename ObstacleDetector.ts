export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle';
}

/**
 * Checks if a given y-coordinate intersects with an obstacle
 * @param y - The y-coordinate to check
 * @param obstacle - The obstacle to check against
 * @returns true if the y-coordinate intersects with the obstacle
 */
export function isYIntersecting(y: number, obstacle: Obstacle): boolean {
  if (obstacle.shape === 'rect') {
    return y >= obstacle.y && y <= obstacle.y + obstacle.height;
  }

  // For circular obstacles, treat width/height as diameter
  // Circle center is at (x + width/2, y + height/2)
  const radius = obstacle.width / 2;
  const centerY = obstacle.y + obstacle.height / 2;

  // Check if y is within the vertical bounds of the circle
  return Math.abs(y - centerY) <= radius;
}

/**
 * Calculates the available width at a given y-coordinate, accounting for obstacles
 * @param y - The y-coordinate to check
 * @param containerWidth - The total width of the container
 * @param obstacles - Array of obstacles to consider
 * @param gap - Minimum gap to maintain around obstacles
 * @returns The maximum available width at the given y-coordinate
 */
export function getAvailableWidth(
  y: number,
  containerWidth: number,
  obstacles: Obstacle[],
  gap: number
): number {
  // Find all obstacles that intersect with this y-coordinate
  const intersectingObstacles = obstacles.filter(obstacle =>
    isYIntersecting(y, obstacle)
  );

  if (intersectingObstacles.length === 0) {
    return containerWidth;
  }

  // Calculate the total width occupied by obstacles and gaps
  let occupiedWidth = 0;

  for (const obstacle of intersectingObstacles) {
    if (obstacle.shape === 'rect') {
      // For rectangles, add the width plus gaps on both sides
      occupiedWidth += obstacle.width + (2 * gap);
    } else {
      // For circles, calculate the width at the given y-coordinate
      const radius = obstacle.width / 2;
      const centerY = obstacle.y + obstacle.height / 2;
      const centerX = obstacle.x + obstacle.width / 2;

      // Calculate the horizontal distance from center at this y
      const verticalDistance = Math.abs(y - centerY);

      if (verticalDistance <= radius) {
        // Use Pythagorean theorem to find horizontal extent
        const horizontalExtent = Math.sqrt(radius * radius - verticalDistance * verticalDistance);
        const circleWidth = 2 * horizontalExtent;
        occupiedWidth += circleWidth + (2 * gap);
      }
    }
  }

  // Return the available width
  const availableWidth = containerWidth - occupiedWidth;
  return Math.max(0, availableWidth);
}
