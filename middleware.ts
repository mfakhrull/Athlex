import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Define an array of routes that need Super Admin access
  const protectedRoutes = ["/create-school", "/schools-list", "/users-list", "/create-user", "/manage-user", "/register-user"];

  // Check if the current route is in the protectedRoutes array
  if (protectedRoutes.includes(request.nextUrl.pathname) && session?.role !== "Super Admin") {
    // If not Super Admin, redirect to /home
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
