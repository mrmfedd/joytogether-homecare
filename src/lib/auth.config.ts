import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma";

function isPublicAdminPath(path: string) {
  return (
    path.startsWith("/admin/login") ||
    path.startsWith("/admin/accept-invite") ||
    path.startsWith("/admin/forgot-password") ||
    path.startsWith("/admin/reset-password")
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
        return !!auth && role === "EMPLOYEE";
      }

      if (path.startsWith("/admin")) {
        if (isPublicAdminPath(path)) return true;
        return !!auth && role !== "EMPLOYEE";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
