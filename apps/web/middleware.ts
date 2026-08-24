import { type NextRequest } from "next/server";

import { updateSession } from "@/data/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp3|mp4|webm|wav|ogg)$).*)",
  ],
};
