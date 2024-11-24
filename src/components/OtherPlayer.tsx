import React, { useContext, useMemo } from "react";
import { Billboard, Text } from "@react-three/drei";
import { AppContext } from "./AppContext";
import Man from "./Man";

interface Player {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

const OtherPlayer: React.FC = () => {
  const { server } = useContext(AppContext);

  const memoizedPlayers = useMemo(() => {
    if (!server.data?.players || server.data.players.length === 0) {
      return null;
    }

    return server.data.players.map((player: Player) => {
      if (!player.position) return null;
      
      return (
        <group 
          key={player.name} 
          position={[player.position.x, player.position.y, player.position.z]}
        >
          <Billboard position={[0, 1.3, 0]} scale={0.2}>
            <Text>{player.name}</Text>
          </Billboard>
          <Man scale={0.2} position={[0, -1, 0]} />
        </group>
      );
    });
  }, [server.data?.players]);

  return <>{memoizedPlayers}</>;
};

export default React.memo(OtherPlayer);
