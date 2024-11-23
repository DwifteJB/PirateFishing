import { useState, useEffect } from "react";

interface KeyType {
  [key: string]: boolean;
}

const useKeyboard = () => {
  const [keys, setKeys] = useState<KeyType>({});

  useEffect(() => {
    const downHandler = ({ key }: { key: string }) =>
      setKeys((prev) => ({ ...prev, [key]: true }));
    const upHandler = ({ key }: { key: string }) =>
      setKeys((prev) => ({ ...prev, [key]: false }));

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  console.log(JSON.stringify(keys));
  return keys;
};

export default useKeyboard;
