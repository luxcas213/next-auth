declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      hasSetPassword?: boolean;
    };
  }

  interface User {
    id: string;
    hasSetPassword?: boolean;
  }
}
