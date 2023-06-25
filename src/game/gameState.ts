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

class GameScore {
  private _score: number;
  private _highScore: number;
  private _timer: number;
  private _isGameOver: boolean;
  private _timeLimitInSecods: number;
  private _onGameOver: VoidFunction;
  private _onGameStart: VoidFunction;

  constructor(
    gameOverCallback: VoidFunction,
    onGameStartCallback: VoidFunction,
    timeLimitInSeconds: number = 60
  ) {
    this._isGameOver = false;
    this._score = 0;
    this._highScore = this.getHighScoreFromLocalStorage() ?? 0;
    this._timer = -1;
    this._timeLimitInSecods = timeLimitInSeconds;
    this._onGameOver = gameOverCallback;
    this._onGameStart = onGameStartCallback;
  }

  get score() {
    return this._score;
  }

  set score(value: number) {
    this._score = value;
    this.updateScore();
  }

  get highScore() {
    const highScoreFromLocalStorage = this.getHighScoreFromLocalStorage() ?? 0;
    this._highScore = highScoreFromLocalStorage;
    return this._highScore;
  }

  set highScore(value: number) {
    this.setHighScoreInLocalStorage(value);
    this._highScore = value;
    this.updateHighScore();
  }

  private setHighScoreInLocalStorage(value: number) {
    if (!Number.isFinite(value)) throw new Error("invalid high score");
    localStorage.setItem("highScore", value.toString());
  }

  private getHighScoreFromLocalStorage(): number | null {
    const highScoreFromLocalStorage = localStorage.getItem("highScore");
    if (highScoreFromLocalStorage != null) {
      const highScore = Number.parseInt(highScoreFromLocalStorage);
      if (Number.isFinite(highScore)) {
        return highScore;
      }
    }
    return null;
  }

  private getScoreElement = () => {
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

  private getHighScoreElement = () => {
    const highScoreElement = document.getElementById("high-score");
    if (highScoreElement) {
      return highScoreElement;
    }
    // create high score element if it doesn't exist
    const newHighScoreElement = document.createElement("div");
    newHighScoreElement.id = "high-score";
    document.body.appendChild(newHighScoreElement);
    return newHighScoreElement;
  };

  private updateScore = () => {
    const scoreElement = this.getScoreElement();
    scoreElement.textContent = `Score: ${this.score}`;
  };

  private updateHighScore = () => {
    const highScoreElement = this.getHighScoreElement();
    highScoreElement.textContent = `High Score: ${this._highScore}`;
  };

  startTimer = () => {
    this._isGameOver = false;
    this._timer = this._timeLimitInSecods;
    this.score = 0;
    this.highScore = this.getHighScoreFromLocalStorage() ?? 0;
    this.updateTimer();
    this._onGameStart();
  };

  updateTimer = () => {
    if (this._isGameOver) return;
    if (this._timer <= 0) {
      this._isGameOver = true;
      return;
    }
    this._timer -= 1;
    this.updateIfGameOver();
    setTimeout(this.updateTimer, 1000);
  };

  get isGameOver() {
    return this._isGameOver;
  }

  get timer() {
    return this._timer;
  }

  private updateIfGameOver = () => {
    if (this._timer <= 0) {
      this._isGameOver = true;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this._onGameOver();
      return true;
    }
    return false;
  };
}

const getGameState = (
  onGameStart: (state: GameStateWithoutScoreState) => void,
  onGameEnd: (state: GameStateWithoutScoreState) => void,
  playerOptions?: PlayerOptions
) => {
  const context = GameContextSingleton.getInstance();
  const player = new PlayerState(context, playerOptions);
  const enemies = new EnemyState(context);
  const gameStateWithoutScoreState = {
    context,
    player,
    enemies,
  };
  const scoreState = new GameScore(
    () => onGameEnd(gameStateWithoutScoreState),
    () => onGameStart(gameStateWithoutScoreState)
  );
  return Object.seal({
    ...gameStateWithoutScoreState,
    scoreState,
  });
};

export interface GameState {
  context: Readonly<GameContextSingleton>;
  player: PlayerState;
  enemies: EnemyState;
  scoreState: GameScore;
}

export type GameStateWithoutScoreState = Omit<GameState, "scoreState">;
export type GameContext = ReturnType<typeof GameContextSingleton.getInstance>;
export default getGameState;
