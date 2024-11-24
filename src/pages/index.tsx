import { Canvas } from "@react-three/fiber";
import SkyBox from "../components/Skybox";

import Terrain from "../components/Terrain";
import CharacterController from "../components/CharacterController";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import RaycastArrow from "../components/RaycastArrow";
import BaseUI from "../components/BaseUI";
import Inventory from "../components/Inventory";
import FishingUI from "../components/FishingUI";
import UsernameModal from "../components/UsernameModal";

const MainPage = () => {
  return (
    <div className="bg-black w-screen h-screen overflow-hidden min-h-screen">
      <BaseUI />
      <UsernameModal />
      <Inventory />
      <FishingUI />
      <Canvas>
        <SkyBox />
        <Suspense>
          <Physics 
            gravity={[0, -9.81, 0]}
            timeStep={1 / 60} // Changed from "vary" to a fixed time step
          >
            <CharacterController />
            <Terrain />
            <RaycastArrow />
          </Physics>
        </Suspense>

        <ambientLight intensity={Math.PI / 2} />
      </Canvas>
    </div>
  );
};

export default MainPage;
