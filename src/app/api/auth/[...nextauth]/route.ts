import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const authHandler = NextAuth(authOptions as any);

export { authHandler as GET, authHandler as POST };
