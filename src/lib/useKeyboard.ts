import { useEffect, useRef, useState } from "react";

const useKeyboard = () => {
  const keys = useRef<{ [key: string]: boolean }>({});
  const [realKeys, setRealKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      keys.current[e.key.toLowerCase()] = true;
      setRealKeys({ ...keys.current, [e.key.toLowerCase()]: true });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      keys.current[e.key.toLowerCase()] = false;
      setRealKeys({ ...keys.current, [e.key.toLowerCase()]: false });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.current = {};
    };
  }, []);

  return {
    keys: realKeys,
    ref: keys,
  };
};

export default useKeyboard;
