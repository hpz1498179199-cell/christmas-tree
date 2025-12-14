import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentData, TreeState } from '../types';
import { COLORS, SETTINGS } from '../constants';
import { easing } from 'maath';

interface OrnamentsProps {
  treeState: TreeState;
}

export const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  // We use separate instanced meshes for different geometries to keep draw calls low
  // but allow variety.
  const meshBoxRef = useRef<THREE.InstancedMesh>(null);
  const meshSphereRef = useRef<THREE.InstancedMesh>(null);

  // Generate Data for all ornaments
  const ornaments = useMemo(() => {
    const items: OrnamentData[] = [];
    const count = SETTINGS.ORNAMENT_COUNT;

    for (let i = 0; i < count; i++) {
      const isBox = Math.random() > 0.6; // 40% boxes (Gifts), 60% spheres (Baubles)
      
      // Scatter Pos
      const r = SETTINGS.SCATTER_RADIUS * 1.2 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const scatterPos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      // Tree Pos
      // Spiral distribution for aesthetic placement
      const h = (Math.random() - 0.5) * (SETTINGS.TREE_HEIGHT - 2); 
      const normH = (h + SETTINGS.TREE_HEIGHT / 2) / SETTINGS.TREE_HEIGHT;
      const coneR = (1.0 - normH) * SETTINGS.TREE_RADIUS * 0.9; // Slightly inside foliage
      const angle = i * 0.5; // Spiral
      const treePos = new THREE.Vector3(
        Math.cos(angle) * coneR,
        h,
        Math.sin(angle) * coneR
      );

      // Color Palette
      const rand = Math.random();
      let color = COLORS.GOLD_METALLIC;
      if (rand > 0.7) color = COLORS.RUBY_ACCENT;
      else if (rand > 0.9) color = COLORS.EMERALD_LITE;

      items.push({
        id: i,
        type: isBox ? 'box' : 'sphere',
        scatterPos,
        treePos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.3 + 0.15,
        color,
        weight: Math.random() * 0.5 + 0.5,
      });
    }
    return items;
  }, []);

  // Split data into buckets for the two instanced meshes
  const { boxData, sphereData } = useMemo(() => {
    return {
      boxData: ornaments.filter(o => o.type === 'box'),
      sphereData: ornaments.filter(o => o.type === 'sphere')
    };
  }, [ornaments]);

  // Temp objects to avoid GC
  const dummyObj = useMemo(() => new THREE.Object3D(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // Current animation progress (0 = scatter, 1 = tree)
  const animState = useRef({ progress: 0 });

  useFrame((state, delta) => {
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Smooth damp the global progress
    easing.damp(animState.current, 'progress', target, SETTINGS.TRANSITION_SPEED, delta);
    
    const t = animState.current.progress;

    const updateMesh = (mesh: THREE.InstancedMesh, data: OrnamentData[]) => {
      if (!mesh) return;

      data.forEach((item, index) => {
        // Interpolate Position
        tempPos.lerpVectors(item.scatterPos, item.treePos, t);
        
        // Add some noise when scattered based on weight
        if (t < 0.95) {
            const floatFactor = (1 - t) * item.weight;
            tempPos.y += Math.sin(state.clock.elapsedTime * item.weight + item.id) * 0.05 * floatFactor;
            
            // Rotation animation when floating
            dummyObj.rotation.copy(item.rotation);
            dummyObj.rotation.x += state.clock.elapsedTime * 0.2 * floatFactor;
            dummyObj.rotation.y += state.clock.elapsedTime * 0.1 * floatFactor;
        } else {
             dummyObj.rotation.copy(item.rotation);
        }

        dummyObj.position.copy(tempPos);
        dummyObj.scale.setScalar(item.scale * (0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 2 + item.id))); // Pulse scale slightly
        dummyObj.updateMatrix();
        
        mesh.setMatrixAt(index, dummyObj.matrix);
        
        // Dynamic color intensity (make them glow when moving)
        tempColor.copy(item.color);
        // Boost brightness during transition
        const energy = Math.sin(t * Math.PI) * 2.0; 
        tempColor.offsetHSL(0, 0, energy * 0.1);
        
        mesh.setColorAt(index, tempColor);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateMesh(meshBoxRef.current!, boxData);
    updateMesh(meshSphereRef.current!, sphereData);
  });

  return (
    <group>
      {/* Boxes / Gifts */}
      <instancedMesh
        ref={meshBoxRef}
        args={[undefined, undefined, boxData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={2}
        />
      </instancedMesh>

      {/* Spheres / Baubles */}
      <instancedMesh
        ref={meshSphereRef}
        args={[undefined, undefined, sphereData.length]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={3}
        />
      </instancedMesh>
    </group>
  );
};