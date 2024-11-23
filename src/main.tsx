import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/global.css";
import MainPage from "./pages";
import { AppProvider } from "./components/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <MainPage />
    </AppProvider>
  </StrictMode>,
);
