import makePlayer, {
  makeEnemy,
  Player,
  PlayerOptions,
  EnemyOptions,
} from "./makePlayer";
import { GameContext } from "../game/gameState";
import {
  updatePlayerPosition as updatePlayerPositionUtil,
  Bounds,
  getRandomPosition,
  isPositionOutOfBounds,
  getUpdatedPlayerPosition,
} from "../positionUtils";

const DEFAULT_SPEED = 1;

/**
 * PLAYER STATE MANAGEMENT
 */
export class PlayerState {
  private player: Player;
  private baseSpeed: number;

  constructor(playerOptions?: PlayerOptions) {
    this.baseSpeed = playerOptions?.userData?.speed ?? DEFAULT_SPEED;
    const userData = { ...playerOptions?.userData, speed: this.baseSpeed };
    this.player = makePlayer({ ...playerOptions, userData });
  }

  getPlayer = () => {
    return this.player;
  };

  setPlayer = (player: Player) => {
    this.player = player;
  };

  addPlayerToScene = (gameContext: GameContext) => {
    gameContext.scene.add(this.player);
  };

  updatePlayerPosition = (gameContext: GameContext, previousBounds: Bounds) => {
    updatePlayerPositionUtil(gameContext, previousBounds, this.player);
    this.updatePlayerSpeed(gameContext);
  };

  updatePlayerSpeed = (gameContext: GameContext, speed?: number) => {
    if (speed != null) {
      this.player.userData.speed = speed;
      return;
    }
    const width = Math.abs(gameContext.camera.right - gameContext.camera.left);
    const height = Math.abs(gameContext.camera.top - gameContext.camera.bottom);
    const aspectRatio = width / height;
    const speedScalingFactor = Math.max(aspectRatio, 1);
    const newSpeed = this.baseSpeed * speedScalingFactor;
    this.player.userData.speed = newSpeed;
  };

  move = (
    gameContext: GameContext,
    direction: { x?: number; y?: number; z?: number }
  ): void => {
    const position = getUpdatedPlayerPosition(this.player, direction);
    if (!isPositionOutOfBounds(position, gameContext)) {
      this.player.position.copy(position);
    }
  };
}

/**
 * ENEMY STATE MANAGEMENT
 */
export class EnemyState {
  private enemies: Player[];
  private spawnIntervalID: ReturnType<typeof setInterval> | null = null;

  constructor(enemies: Player[] = []) {
    this.enemies = [...enemies];
  }

  getEnemies = (): Player[] => {
    return [...this.enemies];
  };

  setEnemies = (enemies: Player[]): void => {
    this.enemies = [...enemies];
  };

  // add enemy to scene
  addEnemyToScene = (
    gameContext: GameContext,
    options: EnemyOptions
  ): Player[] => {
    const enemy = makeEnemy(options);
    gameContext.scene.add(enemy);
    const newEnemies = this.getEnemies().concat(enemy);
    this.setEnemies(newEnemies);
    return newEnemies;
  };

  // remove enemy from scene
  removeEnemyFromScene = (
    gameContext: GameContext,
    enemy: Player
  ): Player[] => {
    gameContext.scene.remove(enemy);
    const newEnemies = this.getEnemies().filter((e) => e.id !== enemy.id);
    this.setEnemies(newEnemies);
    return newEnemies;
  };

  // remove all enemies from scene
  removeAllEnemiesFromScene = (gameContext: GameContext): Player[] => {
    gameContext.scene.remove(...this.getEnemies());
    this.setEnemies([]);
    return this.getEnemies();
  };

  updateEnemiesPosition = (
    gameContext: GameContext,
    previousBounds: Bounds
  ) => {
    this.getEnemies().forEach((enemy) => {
      updatePlayerPositionUtil(gameContext, previousBounds, enemy);
    });
    this.resetSpawnEnemiesInterval(gameContext);
  };

  spawnEnemiesAtRegularInterval = (
    gameContext: GameContext,
    interval: number = 1000
  ) => {
    // if already spawning enemies, do nothing
    if (this.spawnIntervalID !== null) {
      return;
    }
    const leftBound = gameContext.camera.left;
    const rightBound = gameContext.camera.right;
    const topBound = gameContext.camera.top;
    const bottomBound = gameContext.camera.bottom;

    this.spawnIntervalID = setInterval(() => {
      this.addEnemyToScene(gameContext, {
        position: getRandomPosition(
          {
            xmin: leftBound,
            xmax: rightBound,
            ymin: bottomBound,
            ymax: topBound,
          },
          { y: topBound }
        ),
      });
    }, interval);
  };

  clearSpawnEnemiesInterval = () => {
    if (this.spawnIntervalID !== null) {
      clearInterval(this.spawnIntervalID);
      this.spawnIntervalID = null;
    }
  };

  resetSpawnEnemiesInterval = (gameContext: GameContext) => {
    this.clearSpawnEnemiesInterval();
    this.spawnEnemiesAtRegularInterval(gameContext);
  };

  resetEnemies = (gameContext: GameContext) => {
    this.removeAllEnemiesFromScene(gameContext);
    this.resetSpawnEnemiesInterval(gameContext);
  };

  clearEnemies = (gameContext: GameContext) => {
    this.removeAllEnemiesFromScene(gameContext);
    this.clearSpawnEnemiesInterval();
  };
}
