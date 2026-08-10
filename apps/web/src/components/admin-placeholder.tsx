import type { LucideIcon } from "lucide-react";

export function AdminPlaceholder({
  icon: Icon,
  title,
  heading,
  description,
}: {
  icon: LucideIcon;
  title: string;
  heading: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {title}
      </h1>

      <div className="mt-10 rounded-xl border border-dashed p-10 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <h2 className="font-heading text-lg font-semibold">{heading}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        <span className="mt-4 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Pronto
        </span>
      </div>
    </div>
  );
}
