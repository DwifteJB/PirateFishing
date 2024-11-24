import { WS_URL } from "../lib/getURL";
import { AppContextType, Inventory, Settings, Server } from "../types";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isFishing, setIsFishing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [connectedServerId, setConnectedServerId] = useState("");

  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const [serverData, setServerData] = useState<Server>({
    id: "",
    name: "",
    maxPlayers: 0,
    players: [],
  });

  const [isPlayingSolo, setIsPlayingSolo] = useState(false);

  const ConnectToServer = (serverId: string) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close();
    }

    const ws = new WebSocket(
      `${WS_URL}/server/${serverId}?name=${settings.username}`,
    );

    ws.onopen = () => {
      console.log("[WS]: connected to server");
      setConnectedServerId(serverId);
    };

    ws.onclose = () => {
      console.log("[WS]: disconnected from server");
      setWebsocket(null!);
      setConnectedServerId("");
    };

    ws.onmessage = (event) => {
      if (event.data) {
        const data = JSON.parse(event.data.toString());
        if (data.type === "serverData") {
          setServerData(data.server);
        } else if (data.type === "playerPosition") {
          setServerData(prev => {
            const playerIndex = prev.players.findIndex(
              (player) => player.name === data.player,
            );
            if (playerIndex !== -1) {
              const updatedPlayers = [...prev.players];
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                position: data.position,
              };
              return { ...prev, players: updatedPlayers };
            } else {
              return {
                ...prev,
                players: [
                  ...prev.players,
                  { name: data.player, position: data.position },
                ],
              };
            }
          });
        } else if (data.type === "newPlayer") {
          setServerData(prev => ({
            ...prev,
            players: [
              ...prev.players,
              { name: data.player, position: { x: 0, y: 0, z: 0 } },
            ],
          }));
        } else if (data.type === "removePlayer") {
          setServerData(prev => ({
            ...prev,
            players: prev.players.filter(p => p.name !== data.player)
          }));
        }
      }
    };

    setWebsocket(ws);
  };

  const DisconnectFromServer = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close();
      setConnectedServerId("");
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCasting) {
      timer = setInterval(() => {
        if (Math.random() > 0.8) {
          setIsFishing(true);
          setIsCasting(false);
        }
      }, 400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCasting]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isFishing) {
      timer = setTimeout(
        () => {
          setIsFishing(false);
        },
        4000 + Math.random() * 3000,
      );
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFishing]);

  useEffect(() => {
    const invStore = localStorage.getItem("inventory");

    if (invStore) {
      setInventory(JSON.parse(invStore));
    }

    const settingsStore = localStorage.getItem("settings");

    if (settingsStore) {
      setSettings(JSON.parse(settingsStore));
    }
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem("inventory", JSON.stringify(inventory));
    }
  }, [inventory]);

  useEffect(() => {
    if (settings.username && JSON.stringify(settings) !== "{}") {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings]);

  return (
    <AppContext.Provider
      value={{
        isFishing,
        setIsFishing,
        isCasting,
        setIsCasting,
        inventory,
        setInventory,
        settings,
        setSettings,

        position,
        setPosition,

        server: {
          isPlayingSolo,
          setIsPlayingSolo,

          connectedServerId,
          setConnectedServerId,
          data: serverData,
          setData: setServerData,
          websocket,
          ConnectToServer,
          DisconnectFromServer,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
