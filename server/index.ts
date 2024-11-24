import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import expressWs from "express-ws";
import Websockets from "./src/routes/websockets";
import Servers from "./src/lib/servers";

const randomWords = [
  "meow",
  "rmfosho",
  "pirate",
  "plunder",
  "cat",
  "ship",
  "fish",
  "web",
  "booty",
  "dabloon",
  "purr",
  "owo",
];

dotenv.config();
const port = process.env.PORT || 3000;

const { app, getWss, applyTo } = expressWs(express());

app.use(express.static("../dist"));

Websockets(app, getWss);

// pregenerate 5 servers

for (let i = 0; i < 5; i++) {
  Servers.push({
    id: i.toString(),
    name: `${randomWords[Math.floor(Math.random() * randomWords.length)]}-${randomWords[Math.floor(Math.random() * randomWords.length)]}`,
    maxPlayers: 10,
    players: [],
  });
}

app.get("/server/get", (req: Request, res: Response) => {
  const serversWithoutPlayers = Servers.map((server) => {
    return {
      id: server.id,
      name: server.name,
      maxPlayers: server.maxPlayers,
      players: server.players.length,
    };
  });

  res.json(serversWithoutPlayers);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
