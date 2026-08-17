"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Gamepad2,
  LayoutDashboard,
  Repeat,
} from "lucide-react";

import { AccountMenu, type AccountUser } from "@/components/account-menu";
import { cn } from "@/lib/utils";

export type SidebarUser = AccountUser;

export interface SidebarCollector {
  id: string;
  name: string;
  icon: ReactNode;
}

interface ProgramSidebarProps {
  slug: string;
  programName: string;
  user: SidebarUser;
  collectors: SidebarCollector[];
  defaultCollapsed?: boolean;
}

const navRow = (collapsed: boolean) =>
  cn(
    "flex h-9 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
    collapsed ? "justify-center px-0" : "px-2.5",
  );

export function ProgramSidebar({
  slug,
  programName,
  user,
  collectors,
  defaultCollapsed = false,
}: ProgramSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [treeOpen, setTreeOpen] = useState(true);
  const pathname = usePathname();

  const home = `/programs/${slug}`;
  const list = `${home}/collectors`;

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `ronda_sidebar=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expandir" : "Contraer"}
        aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        className="absolute -right-3 top-[3.75rem] z-30 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {collapsed ? (
          <ChevronsRight className="size-3.5" />
        ) : (
          <ChevronsLeft className="size-3.5" />
        )}
      </button>

      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b border-border",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <span
          title={collapsed ? programName : undefined}
          className="font-heading flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
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

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        <Link
          href={home}
          title={collapsed ? "Inicio" : undefined}
          className={cn(
            navRow(collapsed),
            pathname === home
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" />
          {!collapsed && <span className="truncate">Inicio</span>}
        </Link>

        <div className={cn(!collapsed && "flex items-center gap-0.5")}>
          <Link
            href={list}
            title={collapsed ? "Colectores" : undefined}
            className={cn(
              navRow(collapsed),
              !collapsed && "min-w-0 flex-1",
              pathname === list
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ClipboardList className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">Colectores</span>}
          </Link>
          {!collapsed && collectors.length > 0 && (
            <button
              onClick={() => setTreeOpen((o) => !o)}
              aria-expanded={treeOpen}
              aria-label={treeOpen ? "Ocultar juegos" : "Mostrar juegos"}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  !treeOpen && "-rotate-90",
                )}
              />
            </button>
          )}
        </div>

        {(collapsed || treeOpen) && collectors.length > 0 && (
          <ul
            className={cn(
              "flex flex-col gap-0.5 border-l border-border",
              collapsed ? "ml-2.5 pl-1.5" : "ml-[1.0625rem] pl-2",
            )}
          >
            {collectors.map(({ id, name, icon }) => {
              const href = `${list}/${id}`;
              const active = pathname === href;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    title={collapsed ? name : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-lg text-sm transition-colors",
                      collapsed ? "justify-center px-0" : "px-2",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center",
                        collapsed
                          ? "size-3.5 [&_svg]:size-3.5"
                          : "size-4 [&_svg]:size-4",
                      )}
                    >
                      {icon}
                    </span>
                    {!collapsed && <span className="truncate">{name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <span
          title={collapsed ? "Juegos · Pronto" : undefined}
          className={cn(
            navRow(collapsed),
            "mt-1 cursor-default text-muted-foreground/50",
          )}
        >
          <Gamepad2 className="size-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate">Juegos</span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Pronto
              </span>
            </>
          )}
        </span>
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <AccountMenu
          user={user}
          collapsed={collapsed}
          secondary={{
            href: "/programs",
            label: "Cambiar de programa",
            icon: <Repeat />,
          }}
        />
      </div>
    </aside>
  );
}
