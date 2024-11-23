import { AppContextType, Inventory } from "../types";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isFishing, setIsFishing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [inventory, setInventory] = useState<Inventory[]>([]);

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

  return (
    <AppContext.Provider
      value={{
        isFishing,
        setIsFishing,
        isCasting,
        setIsCasting,
        inventory,
        setInventory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
