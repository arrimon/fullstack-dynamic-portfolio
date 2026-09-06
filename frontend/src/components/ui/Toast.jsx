"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const ToastContext = createContext({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, title, description, variant }]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-xl border bg-bg-soft px-4 py-3 shadow-xl shadow-black/40",
                  t.variant === "success" && "border-accent/40",
                  t.variant === "error" && "border-danger/40",
                  t.variant === "info" && "border-line-strong"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    t.variant === "success" && "text-accent-strong",
                    t.variant === "error" && "text-danger",
                    t.variant === "info" && "text-cream-muted"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-cream">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-cream-faint">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-cream-faint transition-colors hover:text-cream"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}