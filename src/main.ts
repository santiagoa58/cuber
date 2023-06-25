import "./style.css";
import getGameState, { GameState } from "./game/gameState";
import addPlayerControlEventListeners from "./player/controls";
import renderGame from "./game/renderGame";
import { getCameraBounds } from "./positionUtils";

const handleWindowResize = (gameState: GameState) => {
  const onWindowResize = () => {
    const gameContext = gameState.context;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const previousCameraBounds = getCameraBounds(gameState.context);
    gameContext.updateCameraBounds();
    gameContext.renderer.setSize(width, height);
    gameState.player.updatePlayerPosition(gameContext, previousCameraBounds);
    gameState.enemies.updateEnemiesPosition(gameContext, previousCameraBounds);
  };
  window.addEventListener("resize", onWindowResize);

  return () => {
    window.removeEventListener("resize", onWindowResize);
  };
};

const initializeEventListeners = (gameState: GameState) => {
  // make canvas responsive
  const removeWindowResizeEventListeners = handleWindowResize(gameState);
  // add event listeners for player movement
  const removePlayerControlEventListeners =
    addPlayerControlEventListeners(gameState);

  return () => {
    removeWindowResizeEventListeners();
    removePlayerControlEventListeners();
  };
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
};

main();
