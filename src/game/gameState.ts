import { Scene, OrthographicCamera, WebGLRenderer } from "three";
import { EnemyState, PlayerState } from "../player/playerState";
import { PlayerOptions } from "../player/makePlayer";

export const getCameraBounds = (defaultScale?: number) => {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const scale = Math.abs(defaultScale ?? 10);
  return {
    left: -aspectRatio * scale,
    right: aspectRatio * scale,
    top: scale,
    bottom: -scale,
  };
};

class GameContextSingleton {
  private static instance: Readonly<GameContextSingleton>;
  public scene: Scene;
  public camera: OrthographicCamera;
  public renderer: WebGLRenderer;

  private constructor() {
    this.scene = new Scene();
    const cameraBounds = getCameraBounds();
    this.camera = new OrthographicCamera(
      cameraBounds.left,
      cameraBounds.right,
      cameraBounds.top,
      cameraBounds.bottom,
      1, // near plane
      1000 // far plane
    );
    this.camera.position.z = 5;
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  updateCameraBounds = (defaultScale?: number) => {
    const cameraBounds = getCameraBounds(defaultScale);
    this.camera.left = cameraBounds.left;
    this.camera.right = cameraBounds.right;
    this.camera.top = cameraBounds.top;
    this.camera.bottom = cameraBounds.bottom;
    this.camera.updateProjectionMatrix();
  };

  public static getInstance() {
    if (!GameContextSingleton.instance) {
      GameContextSingleton.instance = Object.freeze(new GameContextSingleton());
    }
    return GameContextSingleton.instance;
  }
}

const getGameState = (playerOptions?: PlayerOptions) => {
  const context = GameContextSingleton.getInstance();
  const player = new PlayerState(playerOptions);
  const enemies = new EnemyState();
  return {
    context,
    player,
    enemies,
  };
};

// type alias for GameContext
export type GameState = ReturnType<typeof getGameState>;
export type GameContext = ReturnType<typeof GameContextSingleton.getInstance>;
export default getGameState;
