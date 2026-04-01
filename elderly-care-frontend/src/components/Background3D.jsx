import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowingSphere = ({ position, color, speed, scale }) => {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Smooth drifting mathematically mapped to time
    meshRef.current.position.y += Math.sin(t * speed) * 0.005;
    meshRef.current.position.x += Math.cos(t * speed) * 0.005;

    // Heartbeat Volumetric Pulse Math (sharp contraction rhythmic pulse)
    const heartPulse = 1 + 0.2 * Math.pow(Math.sin(t * 2.5 + speed), 16);
    meshRef.current.scale.set(scale * heartPulse, scale * heartPulse, scale * heartPulse);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.9} // High opacity to ensure deep black color
        depthWrite={false}
      />
    </mesh>
  );
};

// Tiny drifting particle logic for logged-in users
const Particle = ({ startPos, speed }) => {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Very gentle float mimicking micro-dust or bubbles
    ref.current.position.y += Math.sin(t * speed.y + startPos.x) * 0.006;
    ref.current.position.x += Math.cos(t * speed.x + startPos.y) * 0.006;
  });

  return (
    <mesh ref={ref} position={[startPos.x, startPos.y, startPos.z]}>
      <sphereGeometry args={[0.07, 16, 16]} /> {/* Tiny dots */}
      <meshBasicMaterial color="#000000" transparent opacity={0.8} /> {/* Premium Dark Black */}
    </mesh>
  );
};

const TinyParticles = ({ count = 50 }) => {
  const particles = useMemo(() => {
    return new Array(count).fill().map(() => ({
      pos: { 
        x: (Math.random() - 0.5) * 25, 
        y: (Math.random() - 0.5) * 20, 
        z: (Math.random() - 0.5) * 10 - 2 
      },
      speed: { 
        x: 0.1 + Math.random() * 0.4, 
        y: 0.1 + Math.random() * 0.4 
      }
    }));
  }, [count]);

  return (
    <group>
      {particles.map((p, i) => <Particle key={i} startPos={p.pos} speed={p.speed} />)}
    </group>
  );
};

const Background3D = ({ isAuth }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: 'var(--background)' }}>
      <Canvas camera={{ position: [0, 0, 10] }} dpr={[1, 2]}> {/* Optimize Pixel Ratio */}
        <ambientLight intensity={1} />
        
        {isAuth ? (
          <TinyParticles count={60} />
        ) : (
          <>
            <GlowingSphere position={[-6, 3, -4]} color="#000000" speed={0.4} scale={2.5} />
            <GlowingSphere position={[6, -4, -6]} color="#000000" speed={0.3} scale={3.5} />
            <GlowingSphere position={[-2, -5, -8]} color="#000000" speed={0.5} scale={4} />
          </>
        )}
      </Canvas>
    </div>
  );
};

export default Background3D;
