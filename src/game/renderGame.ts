import { GameState } from "./gameState";
import { Box3 } from "three";
import { Player } from "../player/makePlayer";
import {
  isPlayerOutOfBounds,
  getUpdatedPlayerPosition,
} from "../positionUtils";

const checkCollision = (player: Player, enemy: Player) => {
  const box1 = new Box3().setFromObject(player);
  const box2 = new Box3().setFromObject(enemy);
  return box1.intersectsBox(box2);
};

const moveEnemy = (enemy: Player, offset: { x?: number; y?: number }) => {
  const newPosition = getUpdatedPlayerPosition(enemy, offset);
  enemy.position.copy(newPosition);
};

const renderMovingEnemies = (gameState: GameState) => {
  // move enemies
  gameState.enemies.getEnemies().forEach((enemy) => {
    moveEnemy(enemy, { y: enemy.userData.speed });
    if (
      isPlayerOutOfBounds(enemy, gameState.context) ||
      checkCollision(gameState.player.getPlayer(), enemy)
    ) {
      gameState.enemies.removeEnemyFromScene(gameState.context, enemy);
    }
  });
};

const renderGame = (gameState: GameState) => {
  const context = gameState.context;
  renderMovingEnemies(gameState);
  requestAnimationFrame(() => renderGame(gameState));
  context.renderer.render(context.scene, context.camera);
};

export default renderGame;
