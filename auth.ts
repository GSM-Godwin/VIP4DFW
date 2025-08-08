import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("AUTH_DEBUG: Authorize - Missing email or password credentials.");
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        console.error(`AUTH_DEBUG: Authorize - User found in DB: ${JSON.stringify(user ? { id: user.id, email: user.email, name: user.name, passwordHashExists: !!user.passwordHash, role: user.role } : null, null, 2)}`);

        if (!user || !user.passwordHash) {
          console.error("AUTH_DEBUG: Authorize - User not found or passwordHash missing for email:", credentials.email);
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          console.error("AUTH_DEBUG: Authorize - Invalid password for email:", credentials.email);
          throw new Error("Invalid credentials")
        }

        console.error(`AUTH_DEBUG: Authorize - User authenticated successfully: ${user.email}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Include role here
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.error(`AUTH_DEBUG: JWT Callback - Token object received: ${JSON.stringify(token, null, 2)}`);
      console.error(`AUTH_DEBUG: JWT Callback - User object received: ${JSON.stringify(user, null, 2)}`);
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role; // Cast to any to access role, as it's a custom property
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email
        session.user.name = token.name
        (session.user as any).role = token.role; // Cast to any to assign role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}
