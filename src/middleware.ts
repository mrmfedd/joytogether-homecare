import { auth } from "@/lib/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isPublicAdmin =
    path.startsWith("/admin/login") || path.startsWith("/admin/accept-invite");
  if (path.startsWith("/admin") && !isPublicAdmin && !req.auth) {
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return Response.redirect(login);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
