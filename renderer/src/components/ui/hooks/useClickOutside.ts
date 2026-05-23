import { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref.
 *
 * @param ref React ref object to the container you want to detect clicks outside of
 * @param handler Callback to fire when a click outside is detected
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: { current: T | null } | { current: T | null }[],
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      
      // Do nothing if clicking any of the ref's elements or descendent elements
      const isInsideAny = refs.some((r) => {
        return r.current && r.current.contains(event.target as Node);
      });

      if (isInsideAny) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
