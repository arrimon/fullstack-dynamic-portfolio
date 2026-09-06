import { cn } from "@/lib/utils";

export function Label({ children, htmlFor, className, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-cream-faint",
        className
      )}
    >
      {children}
      {required && <span className="ml-1 text-accent-strong">*</span>}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-lg border border-line bg-bg-muted px-3.5 text-sm text-cream placeholder:text-cream-faint/60 transition-colors duration-200 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, ...props }) {
  return <input className={cn(fieldClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 5, ...props }) {
  return <textarea className={cn(fieldClasses, "py-3 leading-relaxed", className)} rows={rows} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(fieldClasses, "h-11 appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-danger">
      {children}
    </p>
  );
}

export function Checkbox({ className, ...props }) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-line-strong bg-bg-muted transition-colors checked:border-accent checked:bg-accent checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M3.5%208.5l3%203%206-6%22%20stroke%3D%22%2309090b%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-center bg-no-repeat focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong",
        className
      )}
      {...props}
    />
  );
}