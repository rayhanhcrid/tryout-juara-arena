import { ArrowRight } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/** Stacked fields in one rounded container, separated by hairlines (Apple ID). */
export function FieldGroup({ shake, children }: { shake: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-input bg-card",
        shake && "animate-shake",
      )}
    >
      {children}
    </div>
  );
}

export function FloatingField({
  label,
  trailing,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; trailing?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="relative flex h-14 items-center focus-within:z-10 focus-within:shadow-[inset_0_0_0_2px_var(--color-primary)] first:rounded-t-2xl last:rounded-b-2xl">
      <input
        id={id}
        placeholder=" "
        className="peer h-full w-full bg-transparent px-4 pt-[18px] text-[17px] text-foreground outline-none focus-visible:outline-none"
        {...input}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-muted-foreground transition-all duration-200 ease-apple peer-focus:top-[15px] peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-[15px] peer-[:not(:placeholder-shown)]:text-[12px]"
      >
        {label}
      </label>
      {trailing ? <div className="pr-3">{trailing}</div> : null}
    </div>
  );
}

/** The circular arrow that submits from inside the last field. */
export function SubmitArrow({
  enabled,
  loading,
  label,
}: {
  enabled: boolean;
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={!enabled || loading}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 ease-apple active:scale-90 disabled:cursor-default",
        enabled
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "border border-border text-tertiary",
      )}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      )}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="mt-3 min-h-5 px-1 text-[13px] text-destructive-ink"
    >
      {message}
    </p>
  );
}

export function useShake() {
  const [shake, setShake] = useState(false);
  return {
    shake,
    trigger: () => {
      setShake(false);
      requestAnimationFrame(() => setShake(true));
      setTimeout(() => setShake(false), 450);
    },
  };
}
