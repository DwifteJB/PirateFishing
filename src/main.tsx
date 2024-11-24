import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/global.css";
import MainPage from "./pages";
import { AppProvider } from "./components/AppContext";
import { ChakraProvider } from "@chakra-ui/react";
import { DarkMode } from "@chakra-ui/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider>
      <DarkMode>
        <AppProvider>
          <MainPage />
        </AppProvider>
      </DarkMode>
    </ChakraProvider>
  </StrictMode>,
);
