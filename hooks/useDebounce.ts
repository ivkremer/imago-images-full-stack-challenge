import { useEffect, useState } from 'react';

const DEFAULT_DELAY = 350;

export const useDebounce = <T>(value: T, delay = DEFAULT_DELAY) => {
  const [v, setV] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return v;
};
