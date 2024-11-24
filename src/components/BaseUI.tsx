import { useContext } from "react";
import { AppContext } from "./AppContext";

const BaseUI = () => {
  const Context = useContext(AppContext);
  return (
    <div className="absolute top-0 right-5 z-50 text-right">
      <div className="text-white text-xl">
        really basic fishing game by rmfosho
      </div>
      <div className="text-white text-xl">
        controls: WASD + space = movement
      </div>
      <div className="text-white text-xl">click in water to fish!</div>
      <div className="text-white text-xl">
        press E to open inventory (basic)
      </div>

      <div className="text-white text-xl">fish: {Context.inventory.length}</div>
    </div>
  );
};

export default BaseUI;
