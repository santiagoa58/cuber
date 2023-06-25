import { GameState } from "../game/gameState";

// KEYBOARD CONTROLS
const keyboardEventHandler =
  (gameState: GameState) => (event: KeyboardEvent) => {
    gameState.player.resetPlayerSpeed();
    gameState.enemies.resetEnemiesSpeed();
    const playerSpeed = gameState.player.getPlayer().userData.speed;
    if (!playerSpeed) {
      throw new Error("Player speed not set");
    }
    const offset = playerSpeed;
    //move player with arrow keys
    switch (event.key) {
      case "ArrowUp":
        gameState.player.move({ y: offset });
        break;
      case "ArrowDown":
        gameState.player.move({ y: -offset });
        break;
      case "ArrowLeft":
        gameState.player.move({ x: -offset });
        break;
      case "ArrowRight":
        gameState.player.move({ x: offset });
        break;
    }
  };

// TOUCH CONTROLS
interface TouchPosition {
  clientX: number;
  clientY: number;
  identifier: number;
}

const copyTouch = ({ identifier, clientX, clientY }: Touch): TouchPosition => ({
  identifier,
  clientX,
  clientY,
});

// This function handles the start of a touch event. It records each new touch in the ongoingTouches array.
// Touches can be simultaneous (like multi-touch on a touch screen), so we handle all of them in a loop.
const handleTouchStart = (
  event: TouchEvent,
  ongoingTouches: TouchPosition[]
): TouchPosition[] => {
  const touches = event.changedTouches;
  const localOngoingTouches = [...ongoingTouches];

  for (let touch of touches) {
    localOngoingTouches.push(copyTouch(touch));
  }
  return localOngoingTouches;
};

/**
 * This function handles the movement of a touch. It finds the touch in ongoingTouches array and processes it.
 * After processing, it updates the touch record in ongoingTouches for the next touchmove event.
 * @param event
 * @param ongoingTouches
 * @returns a tuple of the current touch and the previous touch to update the ongoingTouches array
 */
const handleTouchMove = (
  event: TouchEvent,
  ongoingTouches: TouchPosition[]
) => {
  event.preventDefault(); // Prevent the browser's default behavior (scroll, zoom)

  const touches = event.changedTouches;
  for (let touch of touches) {
    const index = ongoingTouches.findIndex(
      (ongoingTouch) => ongoingTouch.identifier === touch.identifier
    );

    if (index >= 0) {
      const previousTouch = ongoingTouches[index];
      return [touch, previousTouch, index] as const;
    }
  }
};

const handleTouchEnd = (
  event: TouchEvent,
  ongoingTouches: TouchPosition[]
): TouchPosition[] => {
  const touches = event.changedTouches;

  for (let touch of touches) {
    const index = ongoingTouches.findIndex(
      (ongoingTouch) => ongoingTouch.identifier === touch.identifier
    );

    if (index >= 0) {
      // Remove the ended touch from the ongoingTouches array
      return ongoingTouches.filter((_, idx) => idx !== index);
    }
  }
  return ongoingTouches;
};

// This function updates the game state (i.e., move player) based on touch movement.
// If touch moves to the right (dx > 0), player moves right, if it moves left (dx < 0), player moves left.
// If touch moves up (dy > 0), player moves up, if it moves down (dy < 0), player moves down.
const updateGameStateOnTouchMove = (
  gameState: GameState,
  touch: Touch,
  ongoingTouch: TouchPosition
) => {
  const speed = gameState.player.getPlayer().userData.speed;
  if (!speed) {
    throw new Error("Player speed not set");
  }

  const dx = touch.clientX - ongoingTouch.clientX;
  const dy = touch.clientY - ongoingTouch.clientY;

  // Update position proportionally to the touch movement
  gameState.player.move({ x: dx * speed, y: -dy * speed });
};

const updateOngoingTouches = (
  ongoingTouches: TouchPosition[],
  touch: Touch,
  index: number
) => {
  if (index >= 0) {
    return ongoingTouches.map((ongoingTouch, idx) =>
      idx === index ? copyTouch(touch) : ongoingTouch
    );
  }

  return ongoingTouches;
};

let ONGOING_TOUCHES: TouchPosition[] = [];

const touchEventHandler = (
  gameState: GameState,
  eventname: "touchmove" | "touchstart" | "touchend"
) => {
  switch (eventname) {
    case "touchstart":
      return (event: TouchEvent) => {
        gameState.player.updatePlayerSpeed(0.01);
        gameState.enemies.updateEnemiesSpeed(-0.1);
        ONGOING_TOUCHES = handleTouchStart(event, ONGOING_TOUCHES);
      };
    case "touchmove":
      return (event: TouchEvent) => {
        const result = handleTouchMove(event, ONGOING_TOUCHES);
        if (result) {
          const [touch, ongoingTouch, index] = result;
          updateGameStateOnTouchMove(gameState, touch, ongoingTouch);
          ONGOING_TOUCHES = updateOngoingTouches(ONGOING_TOUCHES, touch, index);
        }
      };
    case "touchend":
      return (event: TouchEvent) => {
        ONGOING_TOUCHES = handleTouchEnd(event, ONGOING_TOUCHES);
      };
    default:
      throw new Error("Invalid event name");
  }
};

const addPlayerControlEventListeners = (gameState: GameState) => {
  const keydownEventListener = keyboardEventHandler(gameState);
  const touchstartEventListener = touchEventHandler(gameState, "touchstart");
  const touchmoveEventListener = touchEventHandler(gameState, "touchmove");
  const touchendEventListener = touchEventHandler(gameState, "touchend");

  // add event listeners for player movement
  document.addEventListener("keydown", keydownEventListener);
  document.addEventListener("touchstart", touchstartEventListener, {
    passive: false,
  });
  document.addEventListener("touchmove", touchmoveEventListener, {
    passive: false,
  });
  document.addEventListener("touchend", touchendEventListener, {
    passive: false,
  });

  return () => {
    document.removeEventListener("keydown", keydownEventListener);
    document.removeEventListener("touchstart", touchstartEventListener);
    document.removeEventListener("touchmove", touchmoveEventListener);
    document.removeEventListener("touchend", touchendEventListener);
  };
};

export default addPlayerControlEventListeners;
