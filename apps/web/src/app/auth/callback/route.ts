import { NextResponse } from "next/server";

import { createClient } from "@/data/supabase/server";
import { isPlatformAdmin } from "@/data/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const dest = (await isPlatformAdmin()) ? "/admin" : "/programs";
  return NextResponse.redirect(`${origin}${dest}`);
}
