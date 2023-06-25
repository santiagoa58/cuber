import {
  MeshBasicMaterialParameters,
  Vector3,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";

interface PlayerUserData {
  speed?: number;
}

export interface PlayerOptions {
  width?: number;
  height?: number;
  depth?: number;
  color?: MeshBasicMaterialParameters["color"];
  position?: Vector3;
  userData?: PlayerUserData;
}

export interface Player extends Mesh {
  userData: PlayerUserData;
}

const makePlayer = (options?: PlayerOptions) => {
  const defaultOptions: PlayerOptions = {
    width: 1,
    height: 1,
    depth: 1,
    color: 0x00ff00,
  };
  const { width, height, depth, color } = { ...defaultOptions, ...options };
  const geometry = new BoxGeometry(width, height, depth);
  const material = new MeshBasicMaterial({ color });
  const mesh = new Mesh(geometry, material);
  if (options?.position) {
    mesh.position.copy(options.position);
  }
  if (options?.userData) {
    mesh.userData = options.userData;
  }
  return mesh;
};

export type EnemyOptions = PlayerOptions &
  Required<Pick<PlayerOptions, "position">>;

export const makeEnemy = (options: EnemyOptions): Player => {
  const defaultOptions: Partial<EnemyOptions> = {
    color: 0xff0000,
    userData: {
      speed: -0.05,
    },
  };
  const enemy = makePlayer({ ...defaultOptions, ...options });
  enemy.userData = { ...defaultOptions.userData, ...options?.userData };
  return enemy;
};

export default makePlayer;
