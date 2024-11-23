import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import useKeyboard from "../lib/useKeyboard";

interface CharacterControllerProps {
  walkSpeed?: number;
  jumpForce?: number;
}

export default function CharacterController({
  walkSpeed = 10,
  jumpForce = 5,
}: CharacterControllerProps) {
  const characterRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
  const moveDirection = useRef(new Vector3());
  const currentPosition = useRef(new Vector3());
  const isGrounded = useRef(false);
  const lastJumpTime = useRef(0);

  const keys = useKeyboard();

  const { rapier, world } = useRapier();

  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.setTranslation({ x: 0, y: 5, z: 0 }); // Start higher above terrain
    }

    if (controlsRef.current) {
      const controls = controlsRef.current;

      controls.mouseButtons = {
        LEFT: undefined,
        MIDDLE: controls.mouseButtons.MIDDLE,
        RIGHT: controls.mouseButtons.LEFT,
      };
    }
  }, [camera, controlsRef, characterRef]);

  const checkGrounded = () => {
    if (!characterRef.current) return false;

    const position = characterRef.current.translation();
    const origin = { x: position.x, y: position.y, z: position.z };

    origin.y -= 1.0;

    const rayOrigin = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });

    const hit = world.castRay(
      rayOrigin,
      0.2,
      true,
      undefined,
      undefined,
      characterRef.current,
    );

    return hit !== null;
  };

  useFrame(() => {
    if (!characterRef.current) return;

    const position = characterRef.current.translation();
    currentPosition.current.set(position.x, position.y, position.z);

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    moveDirection.current.set(0, 0, 0);

    if (keys["w"]) {
      moveDirection.current.add(cameraDirection);
    }
    if (keys["s"]) {
      moveDirection.current.sub(cameraDirection);
    }
    if (keys["d"]) {
      moveDirection.current.add(
        cameraDirection.clone().cross(new Vector3(0, 1, 0)),
      );
    }
    if (keys["a"]) {
      moveDirection.current.add(
        cameraDirection.clone().cross(new Vector3(0, -1, 0)),
      );
    }
    if (moveDirection.current.length() > 0) {
      moveDirection.current.normalize();
      moveDirection.current.multiplyScalar(walkSpeed);
    }

    isGrounded.current = checkGrounded();

    const velocity = characterRef.current.linvel();

    const horizontalVelocity = {
      x: moveDirection.current.x,
      y: velocity.y,
      z: moveDirection.current.z,
    };

    const currentTime = Date.now();
    if (
      keys[" "] &&
      isGrounded.current &&
      currentTime - lastJumpTime.current > 500
    ) {
      horizontalVelocity.y = jumpForce;
      lastJumpTime.current = currentTime;
    }

    characterRef.current.setLinvel(horizontalVelocity);

    if (controlsRef.current) {
      controlsRef.current.target.set(position.x, position.y, position.z);
    }

    if (position.y < -10) {
      // stops the character fallin thru floor (thanks threejs)
      characterRef.current.setTranslation({ x: 0, y: 50, z: 0 });
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        enableDamping={true}
        dampingFactor={0.3}
        zoomSpeed={1}
        rotateSpeed={1}
        panSpeed={1}
        maxDistance={10}
        minDistance={2}
        enablePan={true}
      />

      <RigidBody
        ref={characterRef}
        colliders="ball"
        mass={1}
        type="dynamic"
        position={[0, 0, 0]}
        enabledRotations={[false, false, false]}
        lockRotations={true}
        friction={0.2}
        restitution={0}
      >
        <Billboard position={[0, 2, 0]} scale={0.2}>
          <Text>Player</Text>
        </Billboard>
        
        <mesh>
          <capsuleGeometry args={[0.5, 1, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>
    </>
  );
}
