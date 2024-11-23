import { useLoader } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";

function SkyBox() {
  const texture = useLoader(TextureLoader, "/SkySkybox.png");

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

export default SkyBox;
