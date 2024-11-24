import { AppContextType, Inventory, Settings } from "../types";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isFishing, setIsFishing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [settings, setSettings] = useState<Settings>({});

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
      timer = setTimeout(() => {
        setIsFishing(false);
      }, (4000) + (Math.random() * 3000)); 
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
  }, [])

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
