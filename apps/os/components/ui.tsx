"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { usePreferences } from "../lib/i18n";
import { STATUSES, type Status } from "../lib/types";
import { Icon } from "./icons";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ---------- Layout ----------

export function PageHeader({ kicker, title, subtitle, actions }: { kicker: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 pb-8 pt-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-fade-up">
        <p className="os-kicker">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({ className, children, as: Tag = "section" }: { className?: string; children: ReactNode; as?: "section" | "div" | "article" }) {
  return <Tag className={cx("os-panel rounded-2xl", className)}>{children}</Tag>;
}

export function PanelHeader({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {kicker && <p className="os-kicker">{kicker}</p>}
        <h2 className={cx("text-base font-semibold tracking-tight", kicker && "mt-1.5")}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ---------- Buttons ----------

type ButtonVariant = "primary" | "quiet" | "ghost" | "danger";

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-5 text-[13px]",
        variant === "primary" && "os-amber-button",
        variant === "quiet" && "os-quiet-button",
        variant === "ghost" && "text-muted transition hover:bg-fg/5 hover:text-fg",
        variant === "danger" && "border border-danger/30 bg-danger/10 text-danger transition hover:bg-danger/15",
        className
      )}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-e-transparent" />}
      {children}
    </button>
  );
}

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cx("inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-fg/5 hover:text-fg disabled:opacity-40", className)}
    >
      {children}
    </button>
  );
}

// ---------- Form fields ----------

export function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-muted">{label}</label>
        {hint && <span className="text-[11px] text-faint">{hint}</span>}
      </div>
      {children(id)}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("os-field", className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx("os-field h-auto resize-none py-3 leading-6", className)} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx("os-field cursor-pointer appearance-none bg-no-repeat pe-9", className)} style={{ backgroundImage: "none" }}>
      {children}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Icon.Search size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-faint" />
      <Input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="ps-10" aria-label={placeholder} />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string; count?: number }>; onChange: (value: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-bg/40 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          type="button"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cx(
            "flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition",
            value === option.value ? "bg-gold text-[#140d03] shadow-[0_6px_18px_rgba(232,160,32,0.25)]" : "text-muted hover:text-fg"
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cx("rounded-md px-1.5 text-[10px] tabular-nums", value === option.value ? "bg-black/15" : "bg-fg/5")}>{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-bg/40 p-4 text-start transition hover:border-gold/30">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="mt-1 block text-xs text-muted">{description}</span>}
      </span>
      <span className={cx("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-gold" : "bg-fg/15")}>
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "start-[22px]" : "start-0.5")} />
      </span>
    </button>
  );
}

// ---------- Status ----------

const statusStyles: Record<Status, string> = {
  pending: "border-gold/30 bg-gold/10 text-gold-text",
  confirmed: "border-info/30 bg-info/10 text-info",
  completed: "border-success/30 bg-success/10 text-success",
  cancelled: "border-line bg-fg/5 text-faint line-through decoration-1",
};

export function StatusPill({ status }: { status: Status }) {
  const { t } = usePreferences();
  return (
    <span className={cx("inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium", statusStyles[status])}>
      {t(`status.${status}`)}
    </span>
  );
}

/** Status pill that doubles as a dropdown for changing the status. */
export function StatusSelect({ value, onChange, disabled, label }: { value: Status; onChange: (status: Status) => void; disabled?: boolean; label: string }) {
  const { t } = usePreferences();
  return (
    <div className="relative inline-flex">
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Status)}
        className={cx("h-7 cursor-pointer appearance-none rounded-full border pe-7 ps-3 text-[11px] font-medium outline-none transition disabled:opacity-50", statusStyles[value])}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status} className="bg-surface text-fg">{t(`status.${status}`)}</option>
        ))}
      </select>
      <Icon.Chevron size={12} className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 rotate-90 opacity-70" />
    </div>
  );
}

// ---------- Feedback ----------

export function EmptyState({ title, hint, action, icon }: { title: string; hint?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gold/15 bg-gold/[0.025] px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold-text">{icon ?? <Icon.Spark />}</span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs leading-5 text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string | null; onRetry?: () => void }) {
  const { t, errorText } = usePreferences();
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger/5 px-6 py-10 text-center">
      <Icon.Alert className="text-danger" />
      <p className="mt-3 text-sm font-medium">{t("error.load")}</p>
      <p className="mt-1 text-xs text-muted">{errorText(message)}</p>
      {onRetry && <Button variant="quiet" size="sm" className="mt-4" onClick={onRetry}><Icon.Refresh size={14} />{t("common.retry")}</Button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line/60">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-40" /><Skeleton className="h-3 w-56 max-w-full" /></div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

// ---------- Sheet (side panel) ----------

export function Sheet({ open, onClose, title, kicker, children, footer }: { open: boolean; onClose: () => void; title: string; kicker?: string; children: ReactNode; footer?: ReactNode }) {
  const { t, language } = usePreferences();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label={t("common.close")} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        style={{ ["--slide-from" as string]: language === "ar" ? "-100%" : "100%" }}
        className="relative flex h-full w-full max-w-lg animate-slide-in flex-col border-s border-gold/20 bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            {kicker && <p className="os-kicker">{kicker}</p>}
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <IconButton label={t("common.close")} onClick={onClose}><Icon.Close /></IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="border-t border-line bg-bg/40 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Two-step delete: first click arms, second confirms. Avoids a modal for a quick action. */
export function DeleteButton({ onConfirm, label, confirmText }: { onConfirm: () => Promise<void> | void; label?: string; confirmText?: string }) {
  const { t } = usePreferences();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant={armed ? "danger" : "ghost"}
        size="sm"
        loading={busy}
        onClick={async () => {
          if (!armed) return setArmed(true);
          setBusy(true);
          try { await onConfirm(); } finally { setBusy(false); setArmed(false); }
        }}
      >
        <Icon.Trash size={14} />
        {armed ? t("common.confirmDelete") : label ?? t("common.delete")}
      </Button>
      {armed && confirmText && <p className="text-xs text-muted">{confirmText}</p>}
    </div>
  );
}

// ---------- Toasts ----------

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div key={toast.id} className={cx("pointer-events-auto flex animate-fade-up items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl", toast.tone === "success" ? "border-gold/30 bg-surface/95" : "border-danger/30 bg-surface/95 text-danger")}>
            {toast.tone === "success" ? <Icon.Check size={16} className="text-gold-text" /> : <Icon.Alert size={16} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ---------- Misc ----------

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  const { t } = usePreferences();
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line/60 px-5 py-4 text-xs text-muted">
      <span>{t("common.pageOf", { page, pages })}</span>
      <div className="flex gap-2">
        <Button variant="quiet" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t("common.previous")}</Button>
        <Button variant="quiet" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t("common.next")}</Button>
      </div>
    </div>
  );
}

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "·";
  return (
    <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gradient-to-br from-gold/20 to-gold/5 text-xs font-semibold text-gold-text", className)}>
      {initials}
    </span>
  );
}
