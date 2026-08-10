import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { data: isAdmin } = await supabase.rpc("is_platform_admin");
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/programs", request.url));
    }

    return response;
  }

  if (pathname !== "/" && !pathname.startsWith("/auth") && !pathname.startsWith("/api")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: programs } = await supabase
        .from("programs")
        .select("id")
        .limit(1);

      if (!programs?.length) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}
