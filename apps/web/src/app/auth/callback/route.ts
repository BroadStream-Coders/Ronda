import { NextResponse } from "next/server";

import { createClient } from "@/data/supabase/server";
import { isPlatformAdmin } from "@/data/admin";
import { claimPendingInvitations } from "@/data/invitations";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    try {
      await claimPendingInvitations();
    } catch {}
  }

  const dest = (await isPlatformAdmin()) ? "/admin" : "/programs";

  // Detrás del proxy de Vercel, request.url trae el host interno del deploy: sin
  // esto la vuelta del login aterriza en una URL que no es la del programa.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    forwardedHost && process.env.NODE_ENV === "production"
      ? `https://${forwardedHost}`
      : origin;

  return NextResponse.redirect(`${base}${dest}`);
}
