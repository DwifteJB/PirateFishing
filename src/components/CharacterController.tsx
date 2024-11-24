import { useContext, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { RigidBody, useRapier, interactionGroups, CapsuleCollider } from "@react-three/rapier";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import useKeyboard from "../lib/useKeyboard";
import { AppContext } from "./AppContext";


interface CharacterControllerProps {
  walkSpeed?: number;
  jumpForce?: number;
}

export default function CharacterController({
  walkSpeed = 10,
  jumpForce = 5,
}: CharacterControllerProps) {
  const Context = useContext(AppContext);
  const characterRef = useRef<any>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
  const moveDirection = useRef(new Vector3());
  const isGrounded = useRef(false);
  const lastJumpTime = useRef(0);

  const GROUND_THRESHOLD = 1.5; 
  const lastGroundedTime = useRef(0);

  const keys = useKeyboard();

  const { rapier, world } = useRapier();

  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.setTranslation({ x: 0, y: 5, z: 0 }); 
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

    const now = Date.now();
    const position = characterRef.current.translation();
    const currentVel = characterRef.current.linvel();
    
    if (currentVel.y > 1) {
      lastGroundedTime.current = 0;
      return false;
    }

   
    const bottomY = position.y; 
    const rayOrigins = [
      { x: position.x, y: bottomY, z: position.z },
      { x: position.x - 0.1, y: bottomY, z: position.z },
      { x: position.x + 0.1, y: bottomY, z: position.z },
    ];

    let hits = 0;
    for (const origin of rayOrigins) {
      const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 });
      const hit = world.castRay(
        ray,
        GROUND_THRESHOLD,
        true,
        undefined,
        interactionGroups(1, [0]) 
      );
      if (hit && hit.timeOfImpact < GROUND_THRESHOLD) hits++;
    }

    const isGroundedNow = hits >= 2;
    
    if (isGroundedNow) {
      lastGroundedTime.current = now;
    }

    return isGroundedNow;
  };

  const checkWater = () => {
    if (!characterRef.current) return false;
    const position = characterRef.current.translation();
    return position.y < -1; 
  };

  useFrame(() => {
    if (!characterRef.current) return;

    const position = characterRef.current.translation();
    const currentVelocity = characterRef.current.linvel();
    
    // Reset movement direction
    isGrounded.current = checkGrounded();
    const inWater = checkWater();

    const effectiveWalkSpeed = inWater ? walkSpeed * 0.5 : walkSpeed;
    const effectiveJumpForce = inWater ? jumpForce * 0.5 : jumpForce;

    // Reset movement direction
    moveDirection.current.set(0, 0, 0);

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Handle movement input
    const isMoving = keys["w"] || keys["s"] || keys["a"] || keys["d"];
    
    if (isMoving) {
      if (keys["w"]) moveDirection.current.add(cameraDirection);
      if (keys["s"]) moveDirection.current.sub(cameraDirection);
      if (keys["d"]) moveDirection.current.add(cameraDirection.clone().cross(new Vector3(0, 1, 0)));
      if (keys["a"]) moveDirection.current.add(cameraDirection.clone().cross(new Vector3(0, -1, 0)));

      moveDirection.current.normalize();
      moveDirection.current.multiplyScalar(effectiveWalkSpeed);
    }

    // Apply horizontal movement
    const horizontalVelocity = {
      x: isMoving ? moveDirection.current.x : currentVelocity.x * 0.95,
      y: currentVelocity.y,
      z: isMoving ? moveDirection.current.z : currentVelocity.z * 0.95
    };

    // Handle vertical movement (water/jumping)
    if (inWater) {
      horizontalVelocity.y = Math.min(currentVelocity.y + 0.5, 2);
    }

    const currentTime = Date.now();
    const canJump = (isGrounded.current || inWater) && 
                   currentTime - lastJumpTime.current > 500;

    if (keys[" "] && canJump) {
      horizontalVelocity.y = effectiveJumpForce;
      lastJumpTime.current = currentTime;
      isGrounded.current = false;
      lastGroundedTime.current = 0; 
    }


    characterRef.current.setLinvel(horizontalVelocity);

    if (controlsRef.current) {
      controlsRef.current.target.set(position.x, position.y, position.z);
    }

    if (position.y < -10) {
      characterRef.current.setTranslation({ x: 0, y: 50, z: 0 });
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        enableDamping={false}
        maxPolarAngle={Math.PI * 0.8}
        maxDistance={10}
        minDistance={3}
        enablePan={false}
      />

      <RigidBody
        ref={characterRef}
        mass={1}
        type="dynamic"
        collisionGroups={interactionGroups(1, [0])} 
        solverGroups={interactionGroups(1, [0])} 
        enabledRotations={[false, false, false]}
        lockRotations={true}
      >

        <CapsuleCollider
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          args={[0.3, 1]}
        />

        <Billboard position={[0, 2, 0]} scale={0.2}>
          <Text>{Context.settings.username || "Player"}</Text>
        </Billboard>
        
        <mesh>
          <capsuleGeometry args={[0.5, 1, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>
    </>
  );
}

