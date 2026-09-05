import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      permissions: string[];
      organizationIds: string[];
      supplierIds: string[];
    } & DefaultSessionUser;
  }
}

type DefaultSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
