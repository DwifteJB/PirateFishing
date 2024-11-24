export interface Player {
  socketId?: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Server {
  id: string;
  name: string;
  maxPlayers: number;

  players: Player[];
}

const Servers: Server[] = [];

export default Servers;
