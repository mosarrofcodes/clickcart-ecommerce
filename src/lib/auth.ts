import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await compare(
        credentials.password as string,
        user.password
      );

      if (!isPasswordValid) {
        return null;
      }

      if (user.isBlocked) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        const existing = await db.user.findUnique({
          where: { email: user.email },
          select: { isBlocked: true },
        });
        if (existing?.isBlocked) return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      if (token.email && !token.role) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
