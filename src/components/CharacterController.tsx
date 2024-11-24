import { useContext, useEffect, useRef } from "react";
import { Vector3 as ThreeVector3 } from "three";
import { Vector3 as RapierVector3 } from "@dimforge/rapier3d-compat";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  OrbitControls,
  Text,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import {
  RigidBody,
  useRapier,
  interactionGroups,
  CapsuleCollider,
} from "@react-three/rapier";

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
  const moveDirection = useRef(new ThreeVector3());
  const isGrounded = useRef(false);
  const lastJumpTime = useRef(0);

  const GROUND_THRESHOLD = 1.5;
  const lastGroundedTime = useRef(0);

  const keys = useKeyboard();

  const { rapier, world } = useRapier();

  const { scene, animations } = useGLTF("/man.glb");
  const { actions } = useAnimations(animations, scene);

  const frameCounter = useRef(0); 


  useEffect(() => {
    console.log(actions);

    if (actions && actions.idle) {
      actions.idle.play();
    }
  }, [actions]);

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

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as any).collider) {
        (child as any).collider = undefined;
      }
    });
  }, [scene]);

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
        interactionGroups(1, [0]),
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
    if (
      !characterRef.current ||
      !Context.server.data
    )
      return; 

    const position = characterRef.current.translation();
    const currentVelocity = characterRef.current.linvel();

    isGrounded.current = checkGrounded();
    const inWater = checkWater();

    const effectiveWalkSpeed = inWater ? walkSpeed * 0.5 : walkSpeed;
    const effectiveJumpForce = inWater ? jumpForce * 0.5 : jumpForce;

    moveDirection.current.set(0, 0, 0);

    const cameraDirection = new ThreeVector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const isMoving =
      keys.ref.current["w"] ||
      keys.ref.current["s"] ||
      keys.ref.current["a"] ||
      keys.ref.current["d"];

    if (isMoving) {
      if (keys.ref.current["w"]) moveDirection.current.add(cameraDirection);
      if (keys.ref.current["s"]) moveDirection.current.sub(cameraDirection);
      if (keys.ref.current["d"])
        moveDirection.current.add(
          cameraDirection.clone().cross(new ThreeVector3(0, 1, 0)),
        );
      if (keys.ref.current["a"])
        moveDirection.current.sub(
          cameraDirection.clone().cross(new ThreeVector3(0, 1, 0)),
        );

      moveDirection.current.normalize();
      moveDirection.current.multiplyScalar(effectiveWalkSpeed);
    }

    const rapierVelocity = new RapierVector3(
      isMoving ? moveDirection.current.x : currentVelocity.x * 0.95,
      currentVelocity.y,
      isMoving ? moveDirection.current.z : currentVelocity.z * 0.95,
    );

    if (inWater) {
      rapierVelocity.y = Math.min(currentVelocity.y + 0.5, 2);
    }

    const currentTime = Date.now();
    const canJump =
      (isGrounded.current || inWater) &&
      currentTime - lastJumpTime.current > 500;

    if (keys.ref.current[" "] && canJump) {
      rapierVelocity.y = effectiveJumpForce;
      lastJumpTime.current = currentTime;
      isGrounded.current = false;
      lastGroundedTime.current = 0;
    }

    if (isMoving) {
      if (!actions.walk || !actions.idle) return;
      if (actions.walk && !actions.walk.isRunning()) {
        actions.idle.stop();
        actions.walk.play();
        console.log("Playing walk animation");
      }
    } else {
      if (!actions.walk || !actions.idle) return;
      if (actions.idle && !actions.idle.isRunning()) {
        actions.walk.stop();
        actions.idle.play();
        console.log("Playing idle animation");
      }
    }

    characterRef.current.setLinvel(rapierVelocity, true);

    if (moveDirection.current.length() > 0) {
      const angle = Math.atan2(
        moveDirection.current.x,
        moveDirection.current.z,
      );
      scene.rotation.y = angle;
    }

    if (controlsRef.current) {
      controlsRef.current.target.set(position.x, position.y, position.z);
    }

    if (position.y < -10) {
      characterRef.current.setTranslation({ x: 0, y: 50, z: 0 });
    }

    frameCounter.current += 1;

    if (frameCounter.current >= 24) {
      frameCounter.current = 0;
      if (
        Context.server.websocket &&
        Context.server.websocket.readyState === WebSocket.OPEN
      ) {
        Context.server.websocket.send(
          JSON.stringify({
            type: "position",
            position: characterRef.current.translation(),
          }),
        );
      }
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
        colliders={false}
        lockTranslations={false} 
      >
        <CapsuleCollider
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          args={[0.01, 1]}
        />

        <Billboard position={[0, 1.3, 0]} scale={0.2}>
          <Text>{Context.settings.username || "Player"}</Text>
        </Billboard>

      
        <primitive object={scene} scale={0.2} position={[0, -1, 0]} />
      </RigidBody>

    </>
  );
}
