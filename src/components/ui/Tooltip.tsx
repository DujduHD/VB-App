import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type TooltipSide = "top" | "bottom" | "left" | "right";

const sideClasses: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export function Tooltip({
  content,
  children,
  delay = 400,
  side = "top",
  maxWidth = 240,
}: {
  content: ReactNode;
  children: ReactNode;
  delay?: number;
  side?: TooltipSide;
  maxWidth?: number;
}) {
  const tooltipId = useId();
  const timeoutRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  const clearDelay = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearDelay();
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay);
  }, [clearDelay, delay]);

  const hide = useCallback(() => {
    clearDelay();
    setVisible(false);
  }, [clearDelay]);

  useEffect(() => () => clearDelay(), [clearDelay]);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          style={{ maxWidth }}
          className={`pointer-events-none absolute z-[100] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs leading-relaxed text-zinc-700 shadow-lg shadow-zinc-900/10 dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-black/40 ${sideClasses[side]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
