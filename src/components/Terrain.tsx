import { useMemo, useRef } from "react";
import { Mesh } from "three";
import { RigidBody } from "@react-three/rapier";

function Terrain() {
  const meshRef = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const size = 5000;
    const resolution = 250;
    const geometry = new Float32Array(resolution * resolution * 3);
    const colors = new Float32Array(resolution * resolution * 3);
    const indices = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
    let indexCount = 0;

    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        const i = (z * resolution + x) * 3;

        const xPos = (x / resolution - 0.5) * size;
        const zPos = (z / resolution - 0.5) * size;

        const frequency = 0.002;
        let height =
          Math.sin(xPos * frequency) * Math.cos(zPos * frequency) * 50 +
          Math.sin(xPos * frequency * 2) * Math.cos(zPos * frequency * 2) * 25 +
          Math.sin(xPos * frequency * 4) *
            Math.cos(zPos * frequency * 4) *
            12.5;

        geometry[i] = xPos;
        geometry[i + 1] = height;
        geometry[i + 2] = zPos;

        const waterLevel = -1;
        if (height < waterLevel) {
          colors[i] = 0.1;
          colors[i + 1] = 0.2;
          colors[i + 2] = 0.4;
        } else if (height < waterLevel + 10) {
          colors[i] = 0.8;
          colors[i + 1] = 0.7;
          colors[i + 2] = 0.4;
        } else if (height < 30) {
          colors[i] = 0.2;
          colors[i + 1] = 0.5;
          colors[i + 2] = 0.1;
        } else {
          colors[i] = 0.4;
          colors[i + 1] = 0.4;
          colors[i + 2] = 0.4;
        }

        if (x < resolution - 1 && z < resolution - 1) {
          const vertexIndex = z * resolution + x;
          indices[indexCount++] = vertexIndex;
          indices[indexCount++] = vertexIndex + resolution;
          indices[indexCount++] = vertexIndex + 1;
          indices[indexCount++] = vertexIndex + 1;
          indices[indexCount++] = vertexIndex + resolution;
          indices[indexCount++] = vertexIndex + resolution + 1;
        }
      }
    }
    return { position: geometry, color: colors, index: indices };
  }, []);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh ref={meshRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={geometry.position.length / 3}
              array={geometry.position}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={geometry.color.length / 3}
              array={geometry.color}
              itemSize={3}
            />
            <bufferAttribute
              attach="index"
              count={geometry.index.length}
              array={geometry.index}
              itemSize={1}
            />
          </bufferGeometry>
          <meshStandardMaterial vertexColors roughness={0.8} />
        </mesh>
      </RigidBody>

      <mesh position={[0, -1, 0]} name="water" rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial
          color="#3a7ea1"
          transparent
          opacity={0.6}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

export default Terrain;
