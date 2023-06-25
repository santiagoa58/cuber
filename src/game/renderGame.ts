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
    const hasCollision = checkCollision(gameState.player.getPlayer(), enemy);
    if (isPlayerOutOfBounds(enemy, gameState.context) || hasCollision) {
      gameState.enemies.removeEnemyFromScene(enemy);
    }
    // update score
    if (hasCollision) {
      gameState.scoreState.score = gameState.scoreState.score + 1;
    }
  });
};

const renderTimer = (gameState: GameState) => {
  let timerElement = document.getElementById("timer");
  // if timerElement does not exist, create it
  if (!timerElement) {
    timerElement = document.createElement("div");
    timerElement.id = "timer";
    document.body.appendChild(timerElement);
  }
  // update timer
  timerElement.textContent = `Time: ${gameState.scoreState.timer}s`;
};

const renderGame = (gameState: GameState): number => {
  const context = gameState.context;
  renderMovingEnemies(gameState);
  renderTimer(gameState);
  const animationFrameID = requestAnimationFrame(() => renderGame(gameState));
  context.renderer.render(context.scene, context.camera);
  return animationFrameID;
};

export default renderGame;
