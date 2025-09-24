import { middleware as checking } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
//updateSession
export async function middleware(request: NextRequest): Promise<NextResponse> {
  return await checking(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
