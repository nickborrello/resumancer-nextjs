declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Backend API server URL */
      BACKEND_API_URL: string;

      /** PostgreSQL database connection string */
      DATABASE_URL: string;

      /** NextAuth.js v5 secret for signing tokens (replaces NEXTAUTH_SECRET) */
      AUTH_SECRET: string;

      /** Google OAuth client ID (NextAuth v5 naming) */
      AUTH_GOOGLE_ID: string;

      /** Google OAuth client secret (NextAuth v5 naming) */
      AUTH_GOOGLE_SECRET: string;

      /** GitHub OAuth client ID (NextAuth v5 naming) */
      AUTH_GITHUB_ID: string;

      /** GitHub OAuth client secret (NextAuth v5 naming) */
      AUTH_GITHUB_SECRET: string;

      /** Microsoft Entra ID OAuth client ID (NextAuth v5 naming) */
      AUTH_MICROSOFT_ENTRA_ID_ID: string;

      /** Microsoft Entra ID OAuth client secret (NextAuth v5 naming) */
      AUTH_MICROSOFT_ENTRA_ID_SECRET: string;

      /** Microsoft Entra ID tenant ID (required for Microsoft OAuth) */
      AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: string;
    }
  }
}

export {};
