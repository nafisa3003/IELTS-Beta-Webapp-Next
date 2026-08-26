import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const STUDENT_ROUTES = ["/dashboard", "/learning", "/practice", "/rewards", "/support"];
const TEACHER_ROUTES = ["/teacher"];
const ADMIN_ROUTES = ["/admin"];
const ANY_ROLE_ROUTES = ["/profile", "/announcements"];
const PROTECTED_ROUTES = [...STUDENT_ROUTES, ...TEACHER_ROUTES, ...ADMIN_ROUTES, ...ANY_ROLE_ROUTES];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = matchesPrefix(pathname, PROTECTED_ROUTES);

  if (!isProtected) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-gated route groups — never trust UI-hiding alone.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("userid", user.id)
    .single();

  const role = profile?.role;

  if (matchesPrefix(pathname, ADMIN_ROUTES) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (matchesPrefix(pathname, TEACHER_ROUTES) && role !== "teacher" && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (matchesPrefix(pathname, STUDENT_ROUTES) && role !== "student") {
    const home = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learning/:path*",
    "/practice/:path*",
    "/rewards/:path*",
    "/support/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/announcements/:path*",
  ],
};
