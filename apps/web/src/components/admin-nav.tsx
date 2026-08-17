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

export function AdminNav({
  unread = 0,
  compact = false,
}: {
  unread?: number;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/programs")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            title={compact ? label : undefined}
            className={cn(
              "relative flex h-9 items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
              compact ? "w-9 justify-center" : "px-2.5",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!compact && <span className="truncate">{label}</span>}
            {href === "/admin/inquiries" &&
              unread > 0 &&
              (compact ? (
                <span
                  aria-label={`${unread} sin leer`}
                  className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
                />
              ) : (
                <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {unread}
                </span>
              ))}
          </Link>
        );
      })}
    </>
  );
}
