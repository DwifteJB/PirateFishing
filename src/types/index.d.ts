export interface Inventory {
  item: string;
  size: number;
}

export interface Settings {
  username?: string;
}

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

export interface AppContextType {
  isFishing: boolean;
  setIsFishing: (isFishing: boolean) => void;

  isCasting: boolean;
  setIsCasting: (isCasting: boolean) => void;

  inventory: Inventory[];
  setInventory: React.Dispatch<React.SetStateAction<Inventory[]>>;

  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;

  position: [number, number, number];
  setPosition: React.Dispatch<React.SetStateAction<[number, number, number]>>;

  server: {
    isPlayingSolo: boolean;
    setIsPlayingSolo: React.Dispatch<React.SetStateAction<boolean>>;

    connectedServerId: string;
    setConnectedServerId: React.Dispatch<React.SetStateAction<string>>;

    data: Server;
    setData: React.Dispatch<React.SetStateAction<Server>>;

    websocket: WebSocket | null;

    ConnectToServer: (serverId: string) => void;
    DisconnectFromServer: () => void;
  };
}
