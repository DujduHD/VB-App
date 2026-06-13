import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Globe,
  Loader2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import {
  checkDomainAvailability,
  DOMAIN_TLDS,
  formatDomainError,
  slugifyDomainLabel,
  type DomainTld,
} from "../../services/domain";
import { InfoTooltip } from "../ui/InfoTooltip";

export type DomainCheckStatus =
  | "idle"
  | "loading"
  | "available"
  | "taken"
  | "error";

const MENU_WIDTH_PX = 112;

function TldPicker({
  value,
  onChange,
}: {
  value: DomainTld;
  onChange: (tld: DomainTld) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH_PX),
    });
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", close);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const menu =
    open &&
    createPortal(
      <ul
        ref={menuRef}
        role="listbox"
        style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH_PX }}
        className="fixed z-[9999] max-h-52 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-vb-border dark:bg-zinc-900"
      >
        {DOMAIN_TLDS.map((ext) => (
          <li key={ext} role="option" aria-selected={value === ext}>
            <button
              type="button"
              onClick={() => {
                onChange(ext);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                value === ext
                  ? "bg-vb-accent/10 font-semibold text-vb-accent"
                  : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {ext}
            </button>
          </li>
        ))}
      </ul>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className="relative shrink-0 border-l border-zinc-200 dark:border-vb-border"
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) updateMenuPosition();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("domainCheck.tldAria")}
        className="flex h-full min-w-[4.25rem] items-center justify-center gap-0.5 bg-zinc-50 px-2.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {value}
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </div>
  );
}

export function DomainCheckBar({
  projectName,
  onStatusChange,
  footer,
  className = "mt-2",
}: {
  projectName: string;
  onStatusChange?: (state: {
    status: DomainCheckStatus;
    checkedDomain: string;
  }) => void;
  footer?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const slugFromName = slugifyDomainLabel(projectName);
  const [domainLabel, setDomainLabel] = useState(slugFromName);
  const [tld, setTld] = useState<DomainTld>(".com");
  const [status, setStatus] = useState<DomainCheckStatus>("idle");
  const [checkedDomain, setCheckedDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setDomainLabel(slugFromName);
    setStatus("idle");
    setCheckedDomain("");
    setErrorMessage("");
  }, [slugFromName]);

  useEffect(() => {
    onStatusChange?.({ status, checkedDomain });
  }, [status, checkedDomain, onStatusChange]);

  const fullDomain = domainLabel ? `${domainLabel}${tld}` : "";

  const handleCheck = async () => {
    if (!domainLabel.trim()) {
      setStatus("error");
      setErrorMessage(t("domainCheck.enterProjectName"));
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setCheckedDomain(fullDomain);

    try {
      const result = await checkDomainAvailability(fullDomain);
      setStatus(result === "available" ? "available" : "taken");
    } catch (err) {
      setStatus("error");
      setErrorMessage(formatDomainError(err));
    }
  };

  return (
    <div className={`${className} space-y-2`}>
      <div className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-zinc-400" />
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {t("domainCheck.title")}
        </span>
        <InfoTooltip
          content={t("tooltips.rdapDomain")}
          label={t("domainCheck.title")}
        />
      </div>

      <div className="flex rounded-lg border border-zinc-200 bg-white dark:border-vb-border dark:bg-zinc-900">
        <input
          type="text"
          value={domainLabel}
          onChange={(e) => {
            setDomainLabel(
              e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            );
            setStatus("idle");
          }}
          placeholder="focusflow"
          aria-label={t("domainCheck.nameAria")}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        <TldPicker
          value={tld}
          onChange={(ext) => {
            setTld(ext);
            setStatus("idle");
          }}
        />
        <button
          type="button"
          onClick={() => void handleCheck()}
          disabled={status === "loading" || !domainLabel.trim()}
          className="flex shrink-0 items-center gap-1 border-l border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-vb-accent transition-colors hover:bg-vb-accent/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-vb-border dark:bg-zinc-800"
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {t("domainCheck.query")}
        </button>
      </div>

      {status === "available" && checkedDomain && (
        <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <Trans
            i18nKey="domainCheck.available"
            values={{ domain: checkedDomain }}
            components={{ strong: <strong className="font-semibold" /> }}
          />
        </p>
      )}

      {status === "taken" && checkedDomain && (
        <p className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
          <Trans
            i18nKey="domainCheck.taken"
            values={{ domain: checkedDomain }}
            components={{ strong: <strong className="font-semibold" /> }}
          />
        </p>
      )}

      {status === "error" && errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      {footer}
    </div>
  );
}
