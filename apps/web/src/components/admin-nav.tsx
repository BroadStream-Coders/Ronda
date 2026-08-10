"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Mail, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Programas", icon: Boxes },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/invitations", label: "Invitaciones", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/programs")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
