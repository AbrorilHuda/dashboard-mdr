import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Check if user is admin based on email or other criteria
        const adminEmails = [
          "admin@maduradev.com",
          "founder@maduradev.com",
          // Add more admin emails as needed
        ]

        token.role = adminEmails.includes(user.email || "") ? "admin" : "user"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "user" | "admin"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
