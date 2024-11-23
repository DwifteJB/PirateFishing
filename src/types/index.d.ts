export interface Inventory {
  item: string;
  size: number;
}

export interface AppContextType {
  isFishing: boolean;
  setIsFishing: (isFishing: boolean) => void;

  isCasting: boolean;
  setIsCasting: (isCasting: boolean) => void;

  inventory: Inventory[];
  setInventory: React.Dispatch<React.SetStateAction<Inventory[]>>;
}
