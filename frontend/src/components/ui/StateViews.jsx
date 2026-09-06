import { ArrowLeft, Boxes, CircleAlert, RefreshCw } from "lucide-react";
import Button from "./Button";

export function EmptyState({ icon: Icon = Boxes, title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-bg-soft px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg-muted text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-cream">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-cream-faint">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry, backHref }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-danger/30 text-danger">
        <CircleAlert className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-cream">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-cream-faint">
          {description}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        {onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </Button>
        )}
        {backHref && (
          <Button size="sm" variant="ghost" href={backHref}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Go back
          </Button>
        )}
      </div>
    </div>
  );
}