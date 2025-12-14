import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMappingExposure: 1.5,
        alpha: false 
      }}
      shadows
    >
      <color attach="background" args={[COLORS.AMBIENT.getStyle()]} />
      
      <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={40} 
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={treeState === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.GOLD_PALE} />
      <pointLight position={[-10, -5, -10]} intensity={1} color={COLORS.EMERALD_LITE} />
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        castShadow 
        color={COLORS.GOLD_METALLIC}
      />

      {/* Content */}
      <group position={[0, -4, 0]}>
        <Suspense fallback={null}>
            <Foliage treeState={treeState} />
            <Ornaments treeState={treeState} />
            {/* Environment Map for reflections */}
            <Environment preset="city" />
        </Suspense>
      </group>

      {/* Background Decor */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Post Processing - The "Arix" Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};