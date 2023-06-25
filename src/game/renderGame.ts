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

const getScoreElement = () => {
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    return scoreElement;
  }
  // create score element if it doesn't exist
  const newScoreElement = document.createElement("div");
  newScoreElement.id = "score";
  document.body.appendChild(newScoreElement);
  return newScoreElement;
};

const updateScore = (gameState: GameState, newScore: number) => {
  gameState.score = newScore;
  const scoreElement = getScoreElement();
  scoreElement.textContent = `Score: ${gameState.score}`;
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
      updateScore(gameState, gameState.score + 1);
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
