import { GameState } from "../game/gameState";

export const getMovePlayerEventListeners =
  (gameState: GameState) => (event: KeyboardEvent) => {
    const playerSpeed = gameState.player.getPlayer().userData.speed;
    if (!playerSpeed) {
      throw new Error("Player speed not set");
    }
    const offset = playerSpeed;
    //move player with arrow keys
    switch (event.key) {
      case "ArrowUp":
        gameState.player.move(gameState.context, { y: offset });
        break;
      case "ArrowDown":
        gameState.player.move(gameState.context, { y: -offset });
        break;
      case "ArrowLeft":
        gameState.player.move(gameState.context, { x: -offset });
        break;
      case "ArrowRight":
        gameState.player.move(gameState.context, { x: offset });
        break;
    }
  };
