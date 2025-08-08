import type { DefaultSession } from "next-auth"
import type { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string // Add the custom 'id' property
      name?: string | null // Add the custom 'name' property
      role?: string | null // Add the custom 'role' property
    } & DefaultSession["user"]
  }

  /**
   * The user object type returned by the `authorize` callback
   */
  interface User {
    id: string
    email: string
    name?: string | null
    role?: string | null // Add the custom 'role' property
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT extends NextAuthJWT {
    id: string // Add the custom 'id' property
    name?: string | null // Add the custom 'name' property
    email?: string | null // Ensure email is also here
    role?: string | null // Add the custom 'role' property
  }
}
