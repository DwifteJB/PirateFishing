import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text, useTexture, useGLTF } from "@react-three/drei";
import { Raycaster, Vector3, Intersection, Mesh, Object3D } from "three";
import { useRapier } from "@react-three/rapier";
import { AppContext } from "./AppContext";


const RaycastArrow = () => {
  const Context = useContext(AppContext);
  const [arrowPosition, setArrowPosition] = useState<Vector3>(
    new Vector3(0, 0, 0),
  );
  const [arrowVisible, setArrowVisible] = useState(false);
  const arrowRef = useRef<Mesh | null>(null);
  const raycaster = useRef(new Raycaster());

  const rapier = useRapier();

  const { camera, gl, mouse, scene } = useThree();

  const arrowTexture = useTexture(
    "/fishing_bobber/textures/Material.001_diffuse.png",
  );

  const bobberScene = useGLTF("/fishing_bobber/scene.gltf");

  const isThrottled = useRef(false);

  const waterRef = useRef<Object3D | null>(null);

  const bobbingPhase = useRef(0);

  useEffect(() => {
    waterRef.current = scene.getObjectByName("water") || null;
  }, [scene]);

  useFrame((_, delta) => {
    if (arrowVisible) {
      if (arrowRef.current) {
        // bobber bobbing animation
        bobbingPhase.current += delta;
        arrowRef.current.position.y = arrowPosition.y + Math.sin(bobbingPhase.current) * 0.1;
      }
    }
  });

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (isThrottled.current) return;
      isThrottled.current = true;

      if (Context.isCasting || Context.isFishing) {
        isThrottled.current = false;
        return;
      }

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse, camera);

      if (!waterRef.current) {
        setArrowVisible(false);
        setTimeout(() => {
          isThrottled.current = false;
        }, 20);
        return;
      }

      const intersects: Intersection[] = raycaster.current.intersectObject(
        waterRef.current,
        false,
      );

      let foundWater = false;
      if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.point.distanceTo(camera.position) <= 30) {
          const rayOrigin = new rapier.rapier.Ray(intersect.point, {
            x: 0,
            y: 1,
            z: 0,
          });

          const secondRay = rapier.world.castRay(
            rayOrigin,
            30,
            true,
            undefined,
            undefined,
            undefined,
          );

          if (secondRay === null) {
            setArrowPosition(
              new Vector3(
                intersect.point.x,
                intersect.point.y - 0.2,
                intersect.point.z,
              ),
            );
            setArrowVisible(true);
            foundWater = true;
          }
        }
      }

      if (!foundWater) {
        setArrowVisible(false);
      }

      setTimeout(() => {
        isThrottled.current = false;
      }, 20); 
    },
    [camera, gl, mouse, Context.isCasting, Context.isFishing],
  );

  const onArrowClick = useCallback(() => {
    if (arrowPosition) {
      if (Context.isCasting && !Context.isFishing) {
        console.log("set not casting!");
        Context.setIsCasting(false);
      } else if (!Context.isFishing) {
        console.log("set casting!");
        Context.setIsCasting(true);
      }
    }
  }, [arrowPosition, Context.isCasting, Context.isFishing]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [onPointerMove]);

  return (
    <>
      {arrowVisible && (Context.isCasting || Context.isFishing) && (
        <Billboard
          position={[arrowPosition.x, arrowPosition.y + 3, arrowPosition.z]}
        >
          <Text
            scale={[1, 1, 1]}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {Context.isFishing
              ? "FISHING..."
              : "CASTING... CLICK THE ARROW TO STOP"}
          </Text>
        </Billboard>
      )}
      <primitive
        object={bobberScene.scene}
        scale={0.3}
        position={arrowPosition}
        onClick={onArrowClick}
        ref={arrowRef}
        visible={arrowVisible}
      >
        <meshStandardMaterial map={arrowTexture} />
      </primitive>
    </>
  );
};

export default RaycastArrow;
