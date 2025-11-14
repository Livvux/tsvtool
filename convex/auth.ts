import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import { ConvexError } from 'convex/values';
import { MutationCtx } from './_generated/server';
import { logger } from '../lib/logger';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
      validatePasswordRequirements: (password: string) => {
        // Mindestlänge: 8 Zeichen
        if (password.length < 8) {
          throw new ConvexError('Das Passwort muss mindestens 8 Zeichen lang sein.');
        }
        // Mindestens eine Zahl
        if (!/\d/.test(password)) {
          throw new ConvexError('Das Passwort muss mindestens eine Zahl enthalten.');
        }
        // Mindestens ein Kleinbuchstabe
        if (!/[a-z]/.test(password)) {
          throw new ConvexError('Das Passwort muss mindestens einen Kleinbuchstaben enthalten.');
        }
        // Mindestens ein Großbuchstabe
        if (!/[A-Z]/.test(password)) {
          throw new ConvexError('Das Passwort muss mindestens einen Großbuchstaben enthalten.');
        }
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      try {
        // If user already exists, return the existing user
        if (args.existingUserId) {
          return args.existingUserId;
        }

        // Create new user in the users table with default role 'input'
        const userId = await ctx.db.insert('users', {
          email: (args.profile.email as string) || '',
          name: args.profile.name as string | undefined,
          role: 'input', // Default role for new users
        });

        return userId;
      } catch (error) {
        logger.error('Error in createOrUpdateUser', error instanceof Error ? error : new Error(String(error)), { action: 'createOrUpdateUser' });
        throw error;
      }
    },
  },
});

