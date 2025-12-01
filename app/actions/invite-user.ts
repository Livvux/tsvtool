'use server';

import { clerkClient, auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { logger } from '@/lib/logger';

export interface InviteUserResult {
  success: boolean;
  error?: string;
  invitationId?: string;
}

/**
 * Server Action to invite a user via Clerk
 * Only accessible by admins
 */
export async function inviteUser(
  emailAddress: string,
  role: 'admin' | 'input' | 'manager'
): Promise<InviteUserResult> {
  try {
    // Check authentication
    const { userId, getToken } = await auth();
    if (!userId) {
      return { success: false, error: 'Nicht authentifiziert' };
    }

    // Get Convex token and verify admin role
    const token = await getToken({ template: 'convex' });
    if (!token) {
      return { success: false, error: 'Authentifizierungsfehler' };
    }

    // Create Convex client and verify user is admin
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      logger.error('NEXT_PUBLIC_CONVEX_URL not configured', new Error('Missing env var'));
      return { success: false, error: 'Serverkonfigurationsfehler' };
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(token);

    // Fetch current user from Convex to verify admin role
    const currentUser = await convex.query(api.users.getCurrent);
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn('Non-admin attempted to invite user', { userId, attemptedRole: role });
      return { success: false, error: 'Nur Administratoren können Benutzer einladen' };
    }

    // Validate email
    const email = emailAddress.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Ungültige E-Mail-Adresse' };
    }

    // Validate role
    if (!['admin', 'input', 'manager'].includes(role)) {
      return { success: false, error: 'Ungültige Rolle' };
    }

    // Get Clerk client
    const client = await clerkClient();

    // Create invitation with role in publicMetadata
    // The role will be available in the user's publicMetadata after sign-up
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sign-up`,
      notify: true,
    });

    // The role is stored in Clerk's publicMetadata and will be available
    // when the user signs up. We also store it in Convex for redundancy.
    // Note: The Convex storage happens via the storeInvitation mutation
    // which can be called separately if needed. For now, we rely on
    // Clerk's publicMetadata and the userInvitations table lookup in store mutation.

    logger.info('User invitation created', {
      emailAddress: email,
      role,
      invitationId: invitation.id,
    });

    return {
      success: true,
      invitationId: invitation.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    // Handle specific Clerk errors
    if (errorMessage.includes('already exists') || errorMessage.includes('already been invited')) {
      return {
        success: false,
        error: 'Diese E-Mail-Adresse wurde bereits eingeladen oder existiert bereits',
      };
    }

    logger.error('Error creating invitation', error instanceof Error ? error : new Error(errorMessage), {
      emailAddress,
      role,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

