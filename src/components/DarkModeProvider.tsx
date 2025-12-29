"use client"; // must be client
import { createContext, useContext, useState, ReactNode } from "react";

type DarkModeContextType = {
  isDark: boolean;
  toggleDark: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export default function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleDark = () => setIsDark((p) => !p);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error("useDarkMode must be used inside DarkModeProvider");
  return context;
};
