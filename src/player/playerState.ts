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

const DEFAULT_PLAYER_SPEED = 1;
const DEFAULT_ENEMY_SPEED = -0.05;

/**
 * PLAYER STATE MANAGEMENT
 */
export class PlayerState {
  private player: Player;
  private baseSpeed: number;
  private gameContext: Readonly<GameContext>;

  constructor(
    gameContext: Readonly<GameContext>,
    playerOptions?: PlayerOptions
  ) {
    this.gameContext = gameContext;
    this.baseSpeed = playerOptions?.userData?.speed ?? DEFAULT_PLAYER_SPEED;
    const userData = { ...playerOptions?.userData, speed: this.baseSpeed };
    this.player = makePlayer({ ...playerOptions, userData });
  }

  getPlayer = () => {
    return this.player;
  };

  setPlayer = (player: Player) => {
    this.player = player;
  };

  addPlayerToScene = () => {
    this.gameContext.scene.add(this.player);
  };

  updatePlayerPosition = (previousBounds: Bounds) => {
    updatePlayerPositionUtil(this.gameContext, previousBounds, this.player);
    this.updatePlayerSpeed();
  };

  updatePlayerSpeed = (speed?: number) => {
    if (speed != null) {
      this.baseSpeed = speed;
    }
    const width = Math.abs(
      this.gameContext.camera.right - this.gameContext.camera.left
    );
    const height = Math.abs(
      this.gameContext.camera.top - this.gameContext.camera.bottom
    );
    const aspectRatio = width / height;
    const speedScalingFactor = Math.max(aspectRatio, 1);
    const newSpeed = this.baseSpeed * speedScalingFactor;
    this.player.userData.speed = newSpeed;
  };

  resetPlayerSpeed = () => {
    this.updatePlayerSpeed(DEFAULT_PLAYER_SPEED);
  };

  move = (direction: { x?: number; y?: number; z?: number }): void => {
    const position = getUpdatedPlayerPosition(this.player, direction);
    if (!isPositionOutOfBounds(position, this.gameContext)) {
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
  private enemiesBaseSpeed: number = DEFAULT_ENEMY_SPEED;
  private gameContext: Readonly<GameContext>;

  constructor(gameContext: Readonly<GameContext>, enemies: Player[] = []) {
    this.gameContext = gameContext;
    const speed = enemies[0]?.userData?.speed ?? this.enemiesBaseSpeed;
    if (speed != this.enemiesBaseSpeed) {
      this.enemiesBaseSpeed = speed;
    }
    // ensure all enemies have the same speed
    this.enemies = enemies.map((enemy) => {
      enemy.userData.speed = this.enemiesBaseSpeed;
      return enemy;
    });
  }

  getEnemies = (): Player[] => {
    return [...this.enemies];
  };

  setEnemies = (enemies: Player[]): void => {
    this.enemies = [...enemies];
  };

  // add enemy to scene
  addEnemyToScene = (options: EnemyOptions): Player[] => {
    const userData = { ...options.userData, speed: this.enemiesBaseSpeed };
    const enemy = makeEnemy({ ...options, userData });
    this.gameContext.scene.add(enemy);
    const newEnemies = this.getEnemies().concat(enemy);
    this.setEnemies(newEnemies);
    return newEnemies;
  };

  // remove enemy from scene
  removeEnemyFromScene = (enemy: Player): Player[] => {
    this.gameContext.scene.remove(enemy);
    const newEnemies = this.getEnemies().filter((e) => e.id !== enemy.id);
    this.setEnemies(newEnemies);
    return newEnemies;
  };

  // remove all enemies from scene
  removeAllEnemiesFromScene = (): Player[] => {
    this.gameContext.scene.remove(...this.getEnemies());
    this.setEnemies([]);
    return this.getEnemies();
  };

  updateEnemiesPosition = (previousBounds: Bounds) => {
    this.getEnemies().forEach((enemy) => {
      updatePlayerPositionUtil(this.gameContext, previousBounds, enemy);
    });
    this.resetSpawnEnemiesInterval();
  };

  updateEnemiesSpeed = (speed: number) => {
    if (speed === this.enemiesBaseSpeed) {
      return;
    }
    this.enemiesBaseSpeed = speed;
    this.getEnemies().forEach((enemy) => {
      enemy.userData.speed = this.enemiesBaseSpeed;
    });
  };

  resetEnemiesSpeed = () => {
    this.updateEnemiesSpeed(DEFAULT_ENEMY_SPEED);
  };

  spawnEnemiesAtRegularInterval = (interval: number = 1000) => {
    // if already spawning enemies, do nothing
    if (this.spawnIntervalID !== null) {
      return;
    }
    const leftBound = this.gameContext.camera.left;
    const rightBound = this.gameContext.camera.right;
    const topBound = this.gameContext.camera.top;
    const bottomBound = this.gameContext.camera.bottom;

    this.spawnIntervalID = setInterval(() => {
      this.addEnemyToScene({
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

  resetSpawnEnemiesInterval = () => {
    this.clearSpawnEnemiesInterval();
    this.spawnEnemiesAtRegularInterval();
  };

  resetEnemies = () => {
    this.removeAllEnemiesFromScene();
    this.resetSpawnEnemiesInterval();
  };

  clearEnemies = () => {
    this.removeAllEnemiesFromScene();
    this.clearSpawnEnemiesInterval();
  };
}
