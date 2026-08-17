"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Repeat,
  Sun,
  type LucideIcon,
} from "lucide-react";

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

export interface SidebarUser {
  name: string | null;
  email: string | null;
  avatar: string | null;
}

interface ProgramSidebarProps {
  slug: string;
  programName: string;
  user: SidebarUser;
}

export function ProgramSidebar({
  slug,
  programName,
  user,
}: ProgramSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const items: {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
    soon?: boolean;
  }[] = [
    {
      href: `/programs/${slug}`,
      label: "Inicio",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/programs/${slug}/collectors`,
      label: "Colectores",
      icon: ClipboardList,
    },
    { href: "", label: "Juegos", icon: Gamepad2, soon: true },
  ];

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b border-border",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <span className="font-heading flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {programName.charAt(0).toUpperCase()}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {programName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Espacio de trabajo
            </span>
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map(({ href, label, icon: Icon, exact, soon }) => {
          const active = soon
            ? false
            : exact
              ? pathname === href
              : pathname.startsWith(href);

          const body = (
            <>
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && soon && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Pronto
                </span>
              )}
            </>
          );

          const shared = cn(
            "flex h-9 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
            collapsed ? "justify-center px-0" : "px-2.5",
          );

          if (soon) {
            return (
              <span
                key={label}
                title={collapsed ? `${label} · Pronto` : undefined}
                className={cn(shared, "cursor-default text-muted-foreground/50")}
              >
                {body}
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                shared,
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {body}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandir" : "Contraer"}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed ? "justify-center px-0" : "px-2.5",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="size-4 shrink-0" />
          ) : (
            <ChevronsLeft className="size-4 shrink-0" />
          )}
          {!collapsed && <span>Contraer</span>}
        </button>

        <AccountMenu user={user} collapsed={collapsed} />
      </div>
    </aside>
  );
}

function AccountMenu({
  user,
  collapsed,
}: {
  user: SidebarUser;
  collapsed: boolean;
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
          "flex h-11 items-center gap-2.5 rounded-lg text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
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
        <DropdownMenuItem render={<Link href="/programs" />}>
          <Repeat /> Cambiar de programa
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut /> Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
