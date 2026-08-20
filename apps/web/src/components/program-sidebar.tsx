"use client";

import { useEffect, useState, type ReactNode } from "react";
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

export interface SidebarItem {
  id: string;
  name: string;
  icon: ReactNode;
}

type Branch = "collectors" | "games";

interface ProgramSidebarProps {
  slug: string;
  programName: string;
  user: SidebarUser;
  collectors: SidebarItem[];
  games: SidebarItem[];
  defaultCollapsed?: boolean;
}

const navRow = (collapsed: boolean) =>
  cn(
    "flex h-9 shrink-0 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
    collapsed ? "justify-center px-0" : "px-2.5",
  );

function SidebarLeaf({
  href,
  name,
  icon,
  collapsed,
}: {
  href: string;
  name: string;
  icon: ReactNode;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      title={collapsed ? name : undefined}
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 rounded-lg text-sm transition-colors",
        collapsed ? "justify-center px-0" : "px-2",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          collapsed ? "size-3.5 [&_svg]:size-3.5" : "size-4 [&_svg]:size-4",
        )}
      >
        {icon}
      </span>
      {!collapsed && <span className="truncate">{name}</span>}
    </Link>
  );
}

function ServiceBranch({
  label,
  icon,
  href,
  items,
  collapsed,
  open,
  onToggle,
  active,
  className,
}: {
  label: string;
  icon: ReactNode;
  href: string;
  items: SidebarItem[];
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  active: boolean;
  className?: string;
}) {
  return (
    <>
      <div
        className={cn(
          "shrink-0",
          !collapsed && "flex items-center gap-0.5",
          className,
        )}
      >
        <Link
          href={href}
          title={collapsed ? label : undefined}
          className={cn(
            navRow(collapsed),
            !collapsed && "min-w-0 flex-1",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {icon}
          {!collapsed && <span className="truncate">{label}</span>}
        </Link>
        {!collapsed && items.length > 0 && (
          <button
            onClick={onToggle}
            aria-expanded={open}
            aria-label={
              (open ? "Ocultar " : "Mostrar ") + label.toLowerCase()
            }
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                !open && "-rotate-90",
              )}
            />
          </button>
        )}
      </div>

      {open && items.length > 0 && (
        <ul
          className={cn(
            "flex min-h-0 flex-col gap-0.5 overflow-y-auto border-l border-border",
            collapsed ? "ml-2.5 pl-1.5" : "ml-[1.0625rem] pl-2",
          )}
        >
          {items.map((item) => (
            <li key={item.id}>
              <SidebarLeaf
                href={href + "/" + item.id}
                name={item.name}
                icon={item.icon}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function ProgramSidebar({
  slug,
  programName,
  user,
  collectors,
  games,
  defaultCollapsed = false,
}: ProgramSidebarProps) {
  const pathname = usePathname();
  const home = `/programs/${slug}`;
  const collectorsHref = `${home}/collectors`;
  const gamesHref = `${home}/games`;

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [open, setOpen] = useState<Branch | null>(() =>
    pathname.startsWith(gamesHref) ? "games" : "collectors",
  );

  useEffect(() => {
    if (pathname.startsWith(gamesHref)) setOpen("games");
    else if (pathname.startsWith(collectorsHref)) setOpen("collectors");
  }, [pathname, gamesHref, collectorsHref]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `ronda_sidebar=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  function toggleBranch(branch: Branch) {
    setOpen((o) => (o === branch ? null : branch));
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

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-2">
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

        <ServiceBranch
          label="Colectores"
          icon={<ClipboardList className="size-4 shrink-0" />}
          href={collectorsHref}
          items={collectors}
          collapsed={collapsed}
          open={open === "collectors"}
          onToggle={() => toggleBranch("collectors")}
          active={pathname === collectorsHref}
        />

        {games.length > 0 ? (
          <ServiceBranch
            label="Juegos"
            icon={<Gamepad2 className="size-4 shrink-0" />}
            href={gamesHref}
            items={games}
            collapsed={collapsed}
            open={open === "games"}
            onToggle={() => toggleBranch("games")}
            active={pathname === gamesHref}
            className="mt-1"
          />
        ) : (
          <span
            title={collapsed ? "Juegos - Pronto" : undefined}
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
        )}
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
