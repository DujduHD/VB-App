import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const options = [
  { value: "light" as const, icon: Sun, label: "Aydınlık" },
  { value: "dark" as const, icon: Moon, label: "Karanlık" },
  { value: "system" as const, icon: Monitor, label: "Sistem" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-vb-border dark:bg-vb-surface">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value
              ? "bg-white text-vb-accent shadow-sm dark:bg-zinc-800"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
