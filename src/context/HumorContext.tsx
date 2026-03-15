import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface HumorContextValue {
  humorMode: boolean;
  toggleHumorMode: () => void;
}

const HumorContext = createContext<HumorContextValue>({
  humorMode: true,
  toggleHumorMode: () => {},
});

export function useHumorMode() {
  return useContext(HumorContext);
}

export function HumorProvider({ children }: { children: ReactNode }) {
  const [humorMode, setHumorMode] = useState(true);

  const toggleHumorMode = useCallback(() => {
    setHumorMode((prev) => !prev);
  }, []);

  return (
    <HumorContext.Provider value={{ humorMode, toggleHumorMode }}>
      {children}
    </HumorContext.Provider>
  );
}
