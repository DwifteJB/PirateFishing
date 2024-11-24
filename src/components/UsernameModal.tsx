import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  Button,
} from "@chakra-ui/react";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

const UsernameModal = () => {
  const Context = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("settings")) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [Context.settings]);

  const realUsername = () => {
    if (username.length < 4) {
      alert("Username must be more than 4 characters");
      return;
    }
    Context.setSettings((prev) => {
      return {
        ...prev,
        username: username,
      };
    });

    setIsOpen(false);
  };

  return (
    <Modal
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <ModalOverlay />
      <ModalContent
        style={{
          backgroundColor: "#101010",
        }}
        className="bg-[#101010]"
      >
        <ModalHeader className="text-white">Enter your username</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-white"
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={realUsername}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UsernameModal;
