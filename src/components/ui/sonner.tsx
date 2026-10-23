import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-hairline group-[.toaster]:bg-card/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:shadow-[var(--shadow-float)] group-[.toaster]:text-[15px] group-[.toaster]:font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "[&_[data-icon]]:text-success",
          error: "[&_[data-icon]]:text-destructive",
          info: "[&_[data-icon]]:text-primary",
          warning: "[&_[data-icon]]:text-warning",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
