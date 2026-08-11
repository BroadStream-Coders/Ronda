import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { RondaLogo } from "@/components/ronda-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/programs">
          <RondaLogo markClassName="size-7" wordClassName="text-lg" />
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
