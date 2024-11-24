import { useContext, useEffect, useState } from "react";
import URL from "../lib/getURL";
import { AppContext } from "./AppContext";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
} from "@chakra-ui/react";

const ServerBrowser = () => {
  const Context = useContext(AppContext);
  const [servers, setServers] = useState<
    {
      id: string;
      name: string;
      players: number;
      maxPlayers: number;
    }[]
  >([]);
  const [isOpen, setIsOpen] = useState(true);

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${URL}/server/get`)
      .then((res) => res.json())
      .then((data) => setServers(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (Context.server.connectedServerId) {
      setIsOpen(false);
    }

    if (Context.server.connectedServerId === "") {
      setIsOpen(true);
    }
  }, [Context.server.connectedServerId]);

  return (
    <>
      <Modal
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          style={{
            backgroundColor: "#101010",
          }}
          className="bg-[#101010]"
        >
          <ModalHeader className="text-white">Servers</ModalHeader>
          <ModalBody>
            <div className="w-full h-full flex-col space-y-2">
              {servers.map((server, index) => {
                return (
                  <div
                    onClick={() => {
                      setSelectedServer(server.id);
                    }}
                    key={index}
                    className={`w-full h-12 hover:bg-black/50 ${selectedServer == server.id ? "bg-black" : ""} flex flex-row border rounded-xl items-center justify-center p-2`}
                  >
                    <div className="w-2/3 inter text-white">{server.name}</div>
                    <div className="w-1/3 inter text-right text-white">
                      {server.players}/{server.maxPlayers} players
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter className="gap-4">
            <Button
              onClick={() => {
                setIsOpen(false);
                Context.server.setIsPlayingSolo(true);
              }}
            >
              Play Solo
            </Button>
            <Button
              onClick={() => {
                if (!selectedServer) {
                  alert("Please select a server");
                  return;
                }
                setIsOpen(false);
                Context.server.ConnectToServer(selectedServer);
              }}
            >
              Connect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ServerBrowser;
