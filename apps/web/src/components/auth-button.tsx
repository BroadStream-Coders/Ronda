"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/data/supabase/client";
import { cn } from "@/lib/utils";

export function AuthButton({ className }: { className?: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={signIn}
        className={cn("h-10 gap-2 px-3.5 text-[15px]", className)}
      >
        <svg viewBox="0 0 24 24" className="size-[17px]" aria-hidden>
          <path
            fill="currentColor"
            d="M12 11v2.8h3.98c-.17 1.03-1.2 3.02-3.98 3.02-2.4 0-4.35-1.98-4.35-4.42s1.95-4.42 4.35-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.86 5.1 14.13 4.4 12 4.4A7.6 7.6 0 1 0 12 19.6c4.39 0 7.29-3.08 7.29-7.42 0-.5-.05-.88-.12-1.26z"
          />
        </svg>
        <span>Ingresar</span>
      </Button>
    );
  }

  const nombre = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;
  const avatar = (user.user_metadata.avatar_url ??
    user.user_metadata.picture) as string | undefined;
  const inicial = (nombre ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium ring-1 ring-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring">
        {avatar ? (
          <Image
            src={avatar}
            alt={nombre ?? "Avatar"}
            width={32}
            height={32}
            className="size-full object-cover"
          />
        ) : (
          inicial
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-1.5 py-1">
          {nombre && <div className="text-sm font-medium">{nombre}</div>}
          <div className="truncate text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut /> Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
