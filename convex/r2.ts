"use node";

import { action, internalAction } from './_generated/server';
import { v } from 'convex/values';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2 Client Singleton
 * Cloudflare R2 is S3-compatible, so we use the AWS SDK
 */
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME not configured');
  }
  return bucket;
}

/**
 * Generate a presigned URL for uploading a file to R2
 * Returns: { uploadUrl, storageId }
 */
export const generateUploadUrl = action({
  args: {
    contentType: v.string(),
    fileExtension: v.string(),
  },
  handler: async (_ctx, args): Promise<{ uploadUrl: string; storageId: string }> => {
    const client = getR2Client();
    const bucket = getBucketName();

    // Generate unique storage ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const storageId = `${timestamp}-${random}.${args.fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: storageId,
      ContentType: args.contentType,
    });

    // Generate presigned URL valid for 1 hour
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    return { uploadUrl, storageId };
  },
});

/**
 * Get a public URL for a stored file
 * Uses R2 public bucket URL if configured, otherwise generates presigned URL
 */
export const getUrl = action({
  args: {
    storageId: v.string(),
  },
  handler: async (_ctx, args): Promise<string | null> => {
    if (!args.storageId) return null;

    // Check for public bucket URL first (faster, no signature)
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (publicUrl) {
      return `${publicUrl}/${args.storageId}`;
    }

    // Fallback to presigned URL
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: args.storageId,
    });

    // Generate presigned URL valid for 7 days
    return await getSignedUrl(client, command, { expiresIn: 604800 });
  },
});

/**
 * Delete a file from R2
 */
export const deleteFile = internalAction({
  args: {
    storageId: v.string(),
  },
  handler: async (_ctx, args): Promise<void> => {
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: args.storageId,
    });

    await client.send(command);
  },
});

/**
 * Get multiple URLs at once (batch operation)
 */
export const getUrls = action({
  args: {
    storageIds: v.array(v.string()),
  },
  handler: async (_ctx, args): Promise<(string | null)[]> => {
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (publicUrl) {
      // Fast path: use public URLs
      return args.storageIds.map((id) => (id ? `${publicUrl}/${id}` : null));
    }

    // Slow path: generate presigned URLs
    const client = getR2Client();
    const bucket = getBucketName();

    const urls = await Promise.all(
      args.storageIds.map(async (storageId) => {
        if (!storageId) return null;

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: storageId,
        });

        return await getSignedUrl(client, command, { expiresIn: 604800 });
      })
    );

    return urls;
  },
});

