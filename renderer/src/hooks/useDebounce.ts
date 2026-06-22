import { useEffect, useState } from "react";

/**
 * Debounces a value by `delay` ms.
 * Clears immediately when the value becomes falsy (e.g. empty string).
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    if (!value) return;
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return value ? debouncedValue : value;
}
