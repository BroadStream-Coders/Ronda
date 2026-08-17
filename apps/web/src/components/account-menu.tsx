"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/data/supabase/client";
import { cn } from "@/lib/utils";

export interface AccountUser {
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export function AccountMenu({
  user,
  collapsed = false,
  secondary,
}: {
  user: AccountUser;
  collapsed?: boolean;
  secondary?: { href: string; label: string; icon: ReactNode };
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const label = user.name ?? user.email ?? "Cuenta";
  const initial = label.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title={collapsed ? label : undefined}
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-lg text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
          collapsed ? "justify-center px-0" : "px-2",
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-medium ring-1 ring-border">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              width={28}
              height={28}
              className="size-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{label}</span>
            <span className="block truncate text-xs text-muted-foreground">
              Mi cuenta
            </span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-60">
        <div className="px-1.5 py-1">
          {user.name && (
            <div className="truncate text-sm font-medium">{user.name}</div>
          )}
          <div className="truncate text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(String(value))}
        >
          <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
          <DropdownMenuRadioItem value="light">
            <Sun /> Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Oscuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> El del sistema
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        {secondary && (
          <DropdownMenuItem render={<Link href={secondary.href} />}>
            {secondary.icon} {secondary.label}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut /> Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
