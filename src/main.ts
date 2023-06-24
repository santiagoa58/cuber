import "./style.css";
import getGameState, { GameState } from "./game/gameState";
import { getMovePlayerEventListeners } from "./player/controls";
import renderGame from "./game/renderGame";
import { getCameraBounds } from "./positionUtils";

const handleWindowResize = (gameState: GameState) => {
  window.addEventListener("resize", (_event) => {
    const gameContext = gameState.context;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const previousCameraBounds = getCameraBounds(gameState.context);
    gameContext.updateCameraBounds();
    gameContext.renderer.setSize(width, height);
    gameState.player.updatePlayerPosition(gameContext, previousCameraBounds);
    gameState.enemies.updateEnemiesPosition(gameContext, previousCameraBounds);
  });
};

const initializeEventListeners = (gameState: GameState) => {
  // make canvas responsive
  handleWindowResize(gameState);
  // add event listeners for player movement
  document.addEventListener("keydown", getMovePlayerEventListeners(gameState));
};

const startGame = (): GameState => {
  const gameState = getGameState();
  gameState.player.addPlayerToScene(gameState.context);
  initializeEventListeners(gameState);
  renderGame(gameState);
  return gameState;
};

const main = () => {
  const gameState = startGame();
  gameState.enemies.spawnEnemiesAtRegularInterval(gameState.context);
  console.log(gameState);
};

main();
