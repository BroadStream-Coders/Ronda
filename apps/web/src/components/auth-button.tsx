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

export function AuthButton() {
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
      <Button variant="ghost" size="sm" onClick={signIn}>
        Entrar
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
