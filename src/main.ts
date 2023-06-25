import "./style.css";
import getGameState, {
  GameState,
  GameStateWithoutScoreState,
} from "./game/gameState";
import addPlayerControlEventListeners from "./player/controls";
import renderGame from "./game/renderGame";
import { getCameraBounds } from "./positionUtils";

const handleWindowResize = (gameState: GameStateWithoutScoreState) => {
  const onWindowResize = () => {
    const gameContext = gameState.context;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const previousCameraBounds = getCameraBounds(gameState.context);
    gameContext.updateCameraBounds();
    gameContext.renderer.setSize(width, height);
    gameState.player.updatePlayerPosition(previousCameraBounds);
    gameState.enemies.updateEnemiesPosition(previousCameraBounds);
  };
  window.addEventListener("resize", onWindowResize);

  return () => {
    window.removeEventListener("resize", onWindowResize);
  };
};

const initializeEventListeners = (
  gameState: GameStateWithoutScoreState
): VoidFunction => {
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

const showRestartButton = () => {
  let restartButton = document.getElementById("restart-button");
  if (!restartButton) {
    // create restart button
    restartButton = document.createElement("button");
    restartButton.id = "restart-button";
    restartButton.innerText = "Restart";
    document.body.appendChild(restartButton);
  }
  restartButton.addEventListener("click", () => {
    window.location.reload();
  });
};

const startGame = (): GameState => {
  let removeEventListeners: VoidFunction;
  let animationFrameID: number;
  const gameState = getGameState(
    (state) => {
      removeEventListeners = initializeEventListeners(state);
      state.player.addPlayerToScene();
      state.enemies.spawnEnemiesAtRegularInterval();
    },
    (state) => {
      removeEventListeners();
      state.enemies.clearEnemies();
      cancelAnimationFrame(animationFrameID);
      showRestartButton();
    }
  );
  gameState.scoreState.startTimer();
  animationFrameID = renderGame(gameState);
  return gameState;
};

startGame();
