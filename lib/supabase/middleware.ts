// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function copyCookies(from: NextResponse, to: NextResponse) {
  // Salin SEMUA cookie yang sudah disiapkan Supabase ke response akhir (redirect/next)
  from.cookies.getAll().forEach((c) => {
    // `c` punya { name, value } dan kadang options; set minimal name+value
    to.cookies.set(c); // Next 13.5+ mendukung langsung passing Cookie object
  });
}

export async function middleware(request: NextRequest) {
  // Selalu mulai dengan response "next" kosong
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // JANGAN set ke request; cukup set ke response
          supabaseResponse = NextResponse.next({ request }); // reset response
          cookiesToSet.forEach(({ name, value, options }) => {
            // pastikan path default
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              path: options?.path ?? "/",
              // secure auto di-handle oleh Supabase; kalau mau paksa:
              // secure: process.env.NODE_ENV === "production",
              // sameSite: options?.sameSite ?? "lax",
            });
          });
        },
      },
    }
  );

  // Penting: jangan ada logic di antara createServerClient dan getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isProtected = pathname.startsWith("/dashboard");

  // Tidak logged in & menuju halaman proteksi -> redirect ke login (SALIN COOKIES!)
  if (!user && isProtected && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    const redirectRes = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectRes);
    return redirectRes;
  }

  // Sudah login & menuju halaman auth -> lempar ke dashboard (SALIN COOKIES!)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectRes = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectRes);
    return redirectRes;
  }

  // Default: lanjutkan request (PASTIKAN return response yg memuat cookies Supabase)
  return supabaseResponse;
}

// Batasi hanya route yang perlu agar tak terjadi loop / intercept asset
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
