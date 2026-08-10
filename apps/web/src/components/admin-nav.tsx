"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Mail,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Programas", icon: Boxes },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/invitations", label: "Invitaciones", icon: Mail },
  { href: "/admin/inquiries", label: "Mensajes", icon: MessageSquare },
];

export function AdminNav({ unread = 0 }: { unread?: number }) {
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
            {href === "/admin/inquiries" && unread > 0 && (
              <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
