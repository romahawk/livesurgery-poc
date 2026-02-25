import { useContext } from "react";
import { ThemeCtx } from "./ThemeContext";

export const useTheme = () => useContext(ThemeCtx);
