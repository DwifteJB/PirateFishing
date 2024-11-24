import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

import fishes from "../lib/fishes";

const FishingUI = () => {
  const Context = useContext(AppContext);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!Context.isFishing) {
      setProgress(0);
    }
  }, [Context.isFishing]);

  useEffect(() => {
    if (Context.isFishing) {
      const decay = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - 2));
      }, 50);
      return () => clearInterval(decay);
    }
  }, [Context.isFishing]);

  useEffect(() => {
    if (progress >= 100) {
      const fish = fishes[Math.floor(Math.random() * fishes.length)];
      const length = Math.floor(
        Math.random() * (fish.size[1] - fish.size[0]) + fish.size[0],
      );

      Context.setInventory((prev) => [
        ...prev,
        { item: fish.name, size: length },
      ]);
      Context.setIsFishing(false);
    }
  }, [progress]);

  useEffect(() => {
    const handleClick = () => {
      if (Context.isFishing) {
        setProgress((prev) => Math.min(100, prev + 15));
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [Context.isFishing]);

  return (
    <div
      className={`select-none absolute z-50 text-center ${Context.isFishing ? "" : "hidden"}`}
      style={{
        top: "80%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="text-white text-2xl">
        click anywhere to fish! quick quick!
      </div>
      <div className="bg-gray-500 w-full h-8 border border-black">
        <div
          className="bg-green-500 h-full border-black border-r-2"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default FishingUI;
