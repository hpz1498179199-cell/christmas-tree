import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface OrnamentData {
  id: number;
  type: 'box' | 'sphere' | 'diamond';
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
  weight: number; // For floating physics variance
}

export interface FoliageUniforms {
  uTime: { value: number };
  uMix: { value: number };
  uColorDeep: { value: THREE.Color };
  uColorLight: { value: THREE.Color };
}