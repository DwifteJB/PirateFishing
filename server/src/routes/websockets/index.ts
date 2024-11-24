import expressWs from "express-ws";
import Servers from "../../lib/servers";
import * as ws from "ws";

export default function Websockets(
  app: expressWs.Application,
  getWss: () => ws.Server,
) {
  app.ws("/server/:id", async (ws, req) => {
    console.log(`New connection established with id: ${req.params.id}`);
    const socketId = req.headers["sec-websocket-key"];
    console.log("socketId", socketId);

    if (!socketId) {
      ws.close(1008, "Invalid socket id!");
      return;
    }

    const Server = Servers.find((server) => server.id === req.params.id);

    if (Server) {
      console.log("Server exists!");

      if (Server.maxPlayers <= Server.players.length) {
        console.log("Server is full!");
        ws.close(1008, "Server is full!");
        return;
      }

      Server.players.push({
        name: (req.query.name as string) || "Player",
        socketId: socketId as string,
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
      });

      (ws as any).serverId = req.params.id;

      ws.on("message", (msg) => {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === "position") {
          const playerIndex = Server.players.findIndex(
            (player) => player.socketId === socketId,
          );
          if (playerIndex !== -1) {
            Server.players[playerIndex].position = parsed.position;

            getWss().clients.forEach((client) => {
              if (
                client !== ws &&
                client.readyState === ws.OPEN &&
                (client as any).serverId === req.params.id
              ) {
                client.send(
                  JSON.stringify({
                    type: "playerPosition",
                    position: parsed.position,
                    player: Server.players[playerIndex].name,
                  }),
                );
              }
            });
          }
        }
      });

      ws.on("close", () => {
        const playerIndex = Server.players.findIndex(
          (player) => player.socketId === socketId,
        );

        if (playerIndex !== -1) {
          const name = Server.players[playerIndex].name;
          Server.players.splice(playerIndex, 1);
          console.log(`Player ${name} left the server!`);

          getWss().clients.forEach((client) => {
            if (
              client !== ws &&
              client.readyState === ws.OPEN &&
              (client as any).serverId === req.params.id
            ) {
              client.send(
                JSON.stringify({
                  type: "removePlayer",
                  player: name,
                }),
              );
            }
          });
        }
      });

      console.log(`Player ${req.query.name} joined the server!`);

      const serverData = {
        id: Server.id,
        name: Server.name,
        maxPlayers: Server.maxPlayers,
        players: Server.players.filter(
          (player) => player.socketId !== socketId,
        ),
      };

      ws.send(
        JSON.stringify({
          type: "serverData",
          server: serverData,
        }),
      );

      getWss().clients.forEach((client) => {
        if (
          client !== ws &&
          client.readyState === ws.OPEN &&
          (client as any).serverId === req.params.id
        ) {
          console.log(
            "Broadcasting new player to clients on the same server!",
            req.query.name,
          );
          client.send(
            JSON.stringify({
              type: "newPlayer",
              player: req.query.name,
            }),
          );
        }
      });
    } else {
      console.log("Server does not exist!");
      ws.close(1008, "Server does not exist!");
    }
  });
}
