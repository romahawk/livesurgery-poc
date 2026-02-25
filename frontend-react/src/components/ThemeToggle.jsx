import { useTheme } from "../theme/useTheme";
import { Sun, Moon } from "lucide-react";

/** Pill-style toggle that fits the app's UI */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "Light" : "Dark";
  const Icon = theme === "dark" ? Sun : Moon; // show target mode icon

  return (
    <button
      type="button"
      onClick={toggle}
      className="mode-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="mode-toggle__label">{next}</span>
    </button>
  );
}
