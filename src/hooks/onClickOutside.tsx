import { useEffect } from "react";

export const useOnClickOutside = (ref: any, handler: (e: Event) => void) => {
    useEffect(() => {
        const listener = (event: Event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener, true);
        document.addEventListener("touchstart", listener, true);

        // cleanup
        return () => {
            document.removeEventListener("mousedown", listener, true);
            document.removeEventListener("touchstart", listener, true);
        };
    }, [ref, handler]);
};

