import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, SETTINGS } from '../constants';
import { TreeState } from '../types';
import { easing } from 'maath';

// Custom Shader for the needles
// Allows high-performance interpolation on the GPU
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMix: { value: 0 }, // 0 = Scatter, 1 = Tree
    uColorDeep: { value: COLORS.EMERALD_DEEP },
    uColorLight: { value: COLORS.GOLD_PALE }, // Tips of needles
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMix;
    
    attribute vec3 aTreePosition;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vMix;

    void main() {
      vUv = uv;
      vRandom = aRandom;
      vMix = uMix;
      
      // Scatter Position (Original 'position' attribute is treated as scatter pos)
      vec3 posScatter = position;
      
      // Add some floating noise to scatter state
      posScatter.y += sin(uTime * 0.5 + aRandom * 10.0) * 0.5;
      posScatter.x += cos(uTime * 0.3 + aRandom * 5.0) * 0.2;
      
      // Tree Position
      vec3 posTree = aTreePosition;
      
      // Add breathing effect to tree state
      float breath = sin(uTime * 1.5 + posTree.y * 0.5) * 0.05;
      posTree += normal * breath;

      // Interpolate
      // Using cubic ease-in-out curve for the mix roughly inside shader or just rely on CPU damping
      vec3 finalPos = mix(posScatter, posTree, uMix);

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      
      // Size attenuation
      float size = (40.0 * aRandom + 20.0) * (1.0 / -mvPosition.z);
      
      // Make particles smaller when in tree form to look dense
      size *= mix(1.0, 0.6, uMix);

      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorDeep;
    uniform vec3 uColorLight;
    uniform float uMix;
    
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Gradient Radial
      float strength = 1.0 - (ll * 2.0);
      strength = pow(strength, 1.5);
      
      // Color mixing
      vec3 color = mix(uColorDeep, uColorLight, vRandom * 0.3); // Basic variation
      
      // Make them glow gold more in scattered state, deeper green in tree state
      vec3 glowColor = mix(vec3(1.0, 0.9, 0.5), uColorDeep, uMix * 0.8);
      color = mix(glowColor, color, strength);
      
      gl_FragColor = vec4(color, strength);
    }
  `
};

interface FoliageProps {
  treeState: TreeState;
}

export const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate Data
  const { positions, treePositions, randoms } = useMemo(() => {
    const count = SETTINGS.FOLIAGE_COUNT;
    const positions = new Float32Array(count * 3);
    const treePositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 1. Scatter Position (Random Sphere)
      const r = SETTINGS.SCATTER_RADIUS * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // 2. Tree Position (Cone)
      // Height from -H/2 to H/2
      const h = (Math.random() - 0.5) * SETTINGS.TREE_HEIGHT; 
      // Normalized height 0 (bottom) to 1 (top)
      const normH = (h + SETTINGS.TREE_HEIGHT / 2) / SETTINGS.TREE_HEIGHT;
      // Radius decreases as we go up
      const coneR = (1.0 - normH) * SETTINGS.TREE_RADIUS;
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      // Distribute points inside the volume of the branch, not just surface
      const radiusOffset = Math.sqrt(Math.random()) * coneR;

      treePositions[i * 3] = Math.cos(angle) * radiusOffset;
      treePositions[i * 3 + 1] = h;
      treePositions[i * 3 + 2] = Math.sin(angle) * radiusOffset;

      // 3. Random attribute
      randoms[i] = Math.random();
    }
    
    return { positions, treePositions, randoms };
  }, []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate the uMix value
      const targetMix = treeState === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      easing.damp(
        shaderRef.current.uniforms.uMix,
        'value',
        targetMix,
        SETTINGS.TRANSITION_SPEED, 
        delta
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePosition"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};