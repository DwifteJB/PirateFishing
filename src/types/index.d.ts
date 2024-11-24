export interface Inventory {
  item: string;
  size: number;
}

export interface Settings {
  username?: string;
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
}
