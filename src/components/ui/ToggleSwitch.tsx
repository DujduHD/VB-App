export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  id,
}: ToggleSwitchProps) {
  return (
    <div className="relative ml-4 shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-vb-accent peer-disabled:opacity-50 dark:bg-zinc-700" />
      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </div>
  );
}
