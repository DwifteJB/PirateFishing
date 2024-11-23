import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import useKeyboard from "../lib/useKeyboard";

const Inventory = () => {
    const { inventory } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const keys = useKeyboard();

    useEffect(() => {
        if (keys["e"]) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [keys]);

    useEffect(() => {

    }, [inventory]);

    return (
        <div className={`w-screen text-center p-12 h-screen absolute bg-black/50 ${isOpen ? "" : "hidden"}`} style={{
            zIndex: 2000
        }} >
            <div className="text-white text-xl">you have {inventory.length} fish</div>

            <div className="text-white text-xl">fish:</div>
            {inventory.map((item, index) => {
                return (
                    <div key={index} className="text-white text-xl">{item.item}: size = {item.size}</div>
                )
            })}
        </div>
    )
}

export default Inventory;