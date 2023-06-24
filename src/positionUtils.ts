import { Vector3 } from "three";
import { GameContext } from "./game/gameState";
import { Player } from "./player/makePlayer";

const isDefined = <T>(value: T | null | undefined): value is T => value != null;
const getRadius = (min: number, max: number): number => Math.abs(max - min) / 2;

/**
 * Returns a random position within the bounds of the radius
 * @param radius the radius of the bounds
 * @returns a vector3 with a random position
 */
export const getRandomPosition = (
  bounds: {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    zmin?: number;
    zmax?: number;
  },
  position?: { x?: number; y?: number; z?: number }
) => {
  const xRadius = getRadius(bounds.xmax, bounds.xmin);
  const yRadius = getRadius(bounds.ymax, bounds.ymin);
  const zRadius =
    isDefined(bounds.zmax) && isDefined(bounds.zmin)
      ? getRadius(bounds.zmax, bounds.zmin)
      : null;

  // ensure the position is within the bounds set by the radius
  // example: if radius is 5, then the position must be between -5 and 5
  const x = position?.x ?? Math.random() * xRadius * 2 - xRadius;
  const y = position?.y ?? Math.random() * yRadius * 2 - yRadius;
  if (zRadius != null) {
    const z = position?.z ?? Math.random() * zRadius * 2 - zRadius;
    return new Vector3(x, y, z);
  }
  return new Vector3(x, y, 0);
};

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Returns a new position for the player based on the previous camera and the new camera
 */
export const getNewPosition = (
  previousBounds: Bounds,
  newBounds: Bounds,
  currentPlayerPosition: Vector3
) => {
  const previousWidth = previousBounds.right - previousBounds.left;
  const previousHeight = previousBounds.top - previousBounds.bottom;
  const newWidth = newBounds.right - newBounds.left;
  const newHeight = newBounds.top - newBounds.bottom;
  // get the offset of the player position in relation to the previous bounds
  const previousXPositionOffset = currentPlayerPosition.x - previousBounds.left;
  const previousYPositionOffset =
    currentPlayerPosition.y - previousBounds.bottom;
  // get the percentage of the previous position in relation to the previous bounds
  const previousXPositionPercentage = previousXPositionOffset / previousWidth;
  const previousYPositionPercentage = previousYPositionOffset / previousHeight;
  // get the new position based on the percentage of the new bounds
  const x = previousXPositionPercentage * newWidth + newBounds.left;
  const y = previousYPositionPercentage * newHeight + newBounds.bottom;
  return new Vector3(x, y, currentPlayerPosition.z);
};

/**
 * Returns the bounds of the camera
 */
export const getCameraBounds = (context: GameContext): Bounds => {
  const camera = context.camera;
  return {
    left: camera.left,
    right: camera.right,
    top: camera.top,
    bottom: camera.bottom,
  };
};

export const updatePlayerPosition = (
  gameContext: GameContext,
  previousBounds: Bounds,
  player: Player
) => {
  const newPlayerPosition = getNewPosition(
    previousBounds,
    getCameraBounds(gameContext),
    player.position
  );
  player.position.copy(newPlayerPosition);
};

export const isPlayerOutOfBounds = (
  player: Player,
  gameContext: GameContext
): boolean => {
  const leftBound = gameContext.camera.left;
  const rightBound = gameContext.camera.right;
  const topBound = gameContext.camera.top;
  const bottomBound = gameContext.camera.bottom;
  const playerPosition = player.position;
  return (
    playerPosition.x < leftBound ||
    playerPosition.x > rightBound ||
    playerPosition.y < bottomBound ||
    playerPosition.y > topBound
  );
};

export const isPositionOutOfBounds = (
  position: { x: number; y: number; z: number },
  gameContext: GameContext
): boolean => {
  const leftBound = gameContext.camera.left;
  const rightBound = gameContext.camera.right;
  const topBound = gameContext.camera.top;
  const bottomBound = gameContext.camera.bottom;
  return (
    position.x < leftBound ||
    position.x > rightBound ||
    position.y < bottomBound ||
    position.y > topBound
  );
};

export const getUpdatedPlayerPosition = (
  player: Player,
  direction: { x?: number; y?: number; z?: number }
): Vector3 => {
  const { x, y, z } = direction;
  const position = new Vector3(
    player.position.x,
    player.position.y,
    player.position.z
  );
  if (x != null && isFinite(x)) {
    position.x += x;
  }
  if (y != null && isFinite(y)) {
    position.y += y;
  }
  if (z != null && isFinite(z)) {
    position.z += z;
  }
  return position;
};
