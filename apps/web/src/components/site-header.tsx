import Link from "next/link";
import { Radio } from "lucide-react";

import { AuthButton } from "@/components/auth-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/programas"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Radio className="size-4" />
          </span>
          Ronda
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
