import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { appEnv, isEntraConfigured } from "@/lib/env";
import { syncUserAccessProfile } from "@/lib/domain/platform-store";

const localAccessUsers = [
  {
    id: "user-admin-1",
    name: "HTSG Platform Admin",
    email: "admin@halotsg.com",
    password: "halo1234",
    role: "Admin",
    memberships: []
  }
];

const providers = [];

if (isEntraConfigured()) {
  providers.push(
    MicrosoftEntraID({
      clientId: appEnv.entraClientId,
      clientSecret: appEnv.entraClientSecret,
      issuer: `https://login.microsoftonline.com/${appEnv.entraTenantId}/v2.0`,
      authorization: { params: { scope: "openid profile email User.Read" } }
    })
  );
}

if (appEnv.authAllowDevCredentials) {
  providers.push(
    Credentials({
      name: "Local Access",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const user = localAccessUsers.find(
          (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: true,
          accessStatus: "Active",
          memberships: user.memberships
        };
      }
    })
  );
}

const authConfig: NextAuthConfig = {
  trustHost: true,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30
  },
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "microsoft-entra-id" && user.email) {
        const synced = await syncUserAccessProfile({ email: user.email, name: user.name });
        if (!synced.isActive || (!synced.memberships.length && synced.role !== "Admin")) {
          return "/signin?error=AccessPending";
        }
        user.id = synced.id;
        user.role = synced.role;
        user.isActive = synced.isActive;
        user.accessStatus = synced.accessStatus;
        user.memberships = synced.memberships;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.userId = user.id;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
        token.accessStatus = user.accessStatus ?? "Active";
        token.memberships = user.memberships ?? [];
      } else if (token.email && isEntraConfigured()) {
        const synced = await syncUserAccessProfile({ email: token.email, name: token.name });
        token.userId = synced.id;
        token.role = synced.role;
        token.isActive = synced.isActive;
        token.accessStatus = synced.accessStatus;
        token.memberships = synced.memberships;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? "");
        session.user.role = String(token.role ?? "Inspector");
        session.user.isActive = Boolean(token.isActive ?? true);
        session.user.accessStatus = String(token.accessStatus ?? "Active");
        session.user.memberships = Array.isArray(token.memberships) ? token.memberships.map((membership) => ({ projectId: String((membership as any).projectId), role: String((membership as any).role) })) : [];
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
