import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PivotControls, MeshTransmissionMaterial, MeshDistortMaterial } from '@react-three/drei';
import type { CanvasObject, CustomShape } from '../store/useAppStore';
import { audioAnalyzer } from '../lib/audioAnalyzer';

interface Shape3DProps {
  canvasObj: CanvasObject;
  shape: CustomShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasObject>) => void;
}

export const Shape3DComponent: React.FC<Shape3DProps> = ({ canvasObj, shape, isSelected, onSelect, onChange }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const effectiveShape = useMemo(() => ({
    ...shape,
    effect: canvasObj.overrideEffect || shape.effect
  }), [shape, canvasObj.overrideEffect]);

  // Convert points to THREE.Shape
  const threeShape = useMemo(() => {
    const s = new THREE.Shape();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // First, find bounds to center the geometry at 0,0 locally
    shape.points.forEach(p => {
      if (p.x === -999999) return;
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    let isNewSubpath = true;
    shape.points.forEach(p => {
      if (p.x === -999999) {
        isNewSubpath = true;
        return;
      }
      // Invert Y because Three.js Y is up, Canvas Y is down
      const px = p.x - cx;
      const py = -(p.y - cy);
      
      if (isNewSubpath) {
        s.moveTo(px, py);
        isNewSubpath = false;
      } else {
        s.lineTo(px, py);
      }
    });
    return s;
  }, [shape.points]);

  // Map absolute canvas pixel coordinates (canvasObj.x) to 3D Viewport units
  // Assuming a virtual base canvas size. Let's use the actual screen size at the moment of drop, 
  // or we can just map it relative to current window.
  // The 2D app stored absolute pixels (e.g. x: 500, y: 300).
  // This is tricky for responsive 3D. Let's assume a standard 1920x1080 canvas map, 
  // or just use a fixed mapping factor.
  // 1 viewport unit = ~100 pixels at z=0 for standard camera setup.
  const PIXELS_PER_UNIT = 100;
  
  const targetX = (canvasObj.x - size.width / 2) / PIXELS_PER_UNIT;
  const targetY = -(canvasObj.y - size.height / 2) / PIXELS_PER_UNIT;

  // Render Loop for Physics and Audio Reactivity
  const seed = useMemo(() => {
    let s = 0;
    for(let i=0; i<canvasObj.id.length; i++) s += canvasObj.id.charCodeAt(i);
    return s;
  }, [canvasObj.id]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;

    let curX = targetX;
    let curY = targetY;
    let curS = (canvasObj.scaleX / 100); // 2D scale was ~1. Let's normalize it. Wait, 2D scale was 1. 100 pixels = 1 scale.
    let curRot = canvasObj.rotation * (Math.PI / 180);

    // Physics Behaviors
    switch (canvasObj.behavior) {
      case 'float':
        curY += Math.sin(t * 2 + seed) * 0.3;
        break;
      case 'pulse':
        const p = 1 + Math.sin(t * 3 + seed) * 0.15;
        curS *= p;
        break;
      case 'spin':
        curRot += (t * 0.5);
        break;
      case 'orbit':
        curX += Math.cos(t + seed) * 1.0;
        curY += Math.sin(t + seed) * 1.0;
        break;
    }

    // Audio Reactivity
    if (canvasObj.audioReactive && audioAnalyzer.getIsInitialized()) {
      const audio = audioAnalyzer.getAudioData();
      const bassBoost = 1 + (audio.bass * 1.5);
      curS *= bassBoost;
      g.rotation.z = curRot + (audio.treble * 0.5);
      g.rotation.x = audio.bass * 0.5; // Pop towards camera!
    } else {
      g.rotation.z = curRot;
      g.rotation.x = 0;
    }

    // Lerp towards target to smooth out network updates
    g.position.lerp(new THREE.Vector3(curX, curY, 0), 0.1);
    g.scale.lerp(new THREE.Vector3(curS, curS, curS), 0.1);
  });

  // Material Selection
  const getMaterial = () => {
    const { type, colors, opacity, intensity } = effectiveShape.effect;
    const baseColor = colors[0] || '#ffffff';
    const secondaryColor = colors[1] || '#aaaaaa';

    switch (type) {
      case 'glass':
        return (
          <MeshTransmissionMaterial 
            backside thickness={intensity * 5} roughness={1 - opacity} 
            transmission={1} ior={1.5} chromaticAberration={0.5} 
            color={baseColor}
          />
        );
      case 'liquid':
      case 'holographic':
        return (
          <meshPhysicalMaterial 
            color={baseColor} emissive={secondaryColor} emissiveIntensity={0.2}
            metalness={1} roughness={0} clearcoat={1} clearcoatRoughness={0.1}
            iridescence={type === 'holographic' ? 1 : 0}
          />
        );
      case 'neon':
        return (
          <meshStandardMaterial 
            color={baseColor} emissive={baseColor} emissiveIntensity={intensity * 2} 
            toneMapped={false} 
          />
        );
      case 'mesh':
      case 'warp':
        return (
          <MeshDistortMaterial 
            color={baseColor} wireframe={type === 'mesh'} 
            distort={intensity * 0.5} speed={2} roughness={0.4} 
          />
        );
      case 'aberration':
      case 'noise':
      default:
        return (
          <meshStandardMaterial 
            color={baseColor} roughness={0.6} metalness={0.2} 
          />
        );
    }
  };

  return (
    <PivotControls
      visible={isSelected}
      disableAxes={!isSelected}
      disableSliders={!isSelected}
      disableRotations={!isSelected}
      activeAxes={[true, true, false]} // Only move in XY plane for now
      scale={1.5}
      onDragEnd={() => {
        if (!groupRef.current) return;
        // Map 3D coords back to Canvas Pixels
        const newX = (groupRef.current.position.x * PIXELS_PER_UNIT) + (size.width / 2);
        const newY = -(groupRef.current.position.y * PIXELS_PER_UNIT) + (size.height / 2);
        onChange({ x: newX, y: newY });
      }}
    >
      <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <extrudeGeometry args={[threeShape, { depth: effectiveShape.effect.intensity * 20, bevelEnabled: true, bevelThickness: 2, bevelSize: 1, bevelSegments: 3, curveSegments: 12 }]} />
          {getMaterial()}
        </mesh>
      </group>
    </PivotControls>
  );
};
