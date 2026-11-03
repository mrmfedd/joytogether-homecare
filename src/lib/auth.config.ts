import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

function isPublicAdminPath(path: string) {
  return (
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/accept-invite") ||
    path.startsWith("/admin/forgot-password") ||
    path.startsWith("/admin/reset-password") ||
    path.startsWith("/admin/account-recovery")
  );
}

function isPublicEmployeePath(path: string) {
  return (
    path.startsWith("/employee/login") ||
    path.startsWith("/employee/accept-invite") ||
    path.startsWith("/employee/forgot-password") ||
    path.startsWith("/employee/reset-password")
  );
}

function employeeSignInRedirect(request: { nextUrl: URL }) {
  const url = new URL(request.nextUrl.toString());
  url.pathname = "/employee/login";
  url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return Response.redirect(url);
}

function adminSignInRedirect(request: { nextUrl: URL }) {
  const url = new URL(request.nextUrl.toString());
  url.pathname = "/admin/login";
  url.searchParams.set("callbackUrl", request.nextUrl.href);
  return Response.redirect(url);
}

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const role = auth?.user?.role as UserRole | undefined;

      if (path.startsWith("/employee")) {
        if (isPublicEmployeePath(path)) return true;
        if (!auth) return employeeSignInRedirect(request);
        if (role !== "EMPLOYEE") {
          const url = new URL(request.nextUrl.toString());
          url.pathname = "/admin";
          return Response.redirect(url);
        }
        return true;
      }

      if (path.startsWith("/admin")) {
        if (isPublicAdminPath(path)) return true;
        if (!auth) return adminSignInRedirect(request);
        if (role === "EMPLOYEE") {
          const url = new URL(request.nextUrl.toString());
          url.pathname = "/employee";
          return Response.redirect(url);
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
      }
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { sessionVersion: true, active: true },
        });
        if (!dbUser?.active) {
          token.sessionInvalid = true;
          return token;
        }
        const tokenVersion = (token.sessionVersion as number | undefined) ?? 0;
        if (dbUser.sessionVersion !== tokenVersion) {
          token.sessionInvalid = true;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.sessionInvalid) {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
