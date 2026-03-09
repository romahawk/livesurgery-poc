import { createContext } from "react";

export const ThemeCtx = createContext({ theme: "light", setTheme: () => {}, toggle: () => {} });
