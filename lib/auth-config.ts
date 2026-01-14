import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          isAdmin: user.isAdmin || false,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Create or update user in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          const isAdmin = user.email === "giannisaliev@gmail.com";

          if (existingUser) {
            // Update existing user
            await prisma.user.update({
              where: { email: user.email },
              data: { 
                isAdmin,
                image: user.image,
                emailVerified: new Date(),
              },
            });
          } else {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                image: user.image,
                isAdmin,
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Error creating/updating user:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // On sign in, fetch user from database
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { 
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            isAdmin: true 
          },
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.isAdmin = dbUser.isAdmin;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: true, // Enable debug mode to see what's happening
  secret: process.env.NEXTAUTH_SECRET,
};
