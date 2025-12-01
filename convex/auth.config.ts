/**
 * Convex authentication configuration for Clerk integration.
 * 
 * This file configures Convex to validate JWT tokens from Clerk.
 * The domain should match your Clerk Frontend API URL.
 * 
 * @see https://docs.convex.dev/auth/clerk
 */
export default {
  providers: [
    {
      // Use the Clerk issuer URL from your Clerk Dashboard
      // This is typically https://<your-clerk-instance>.clerk.accounts.dev
      // or your custom domain if configured
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: 'convex',
    },
  ],
};

