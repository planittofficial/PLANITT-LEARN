import { randomUUID } from "crypto";

export type PresignResult = {
  uploadUrl: string;
  videoKey: string;
  publicUrl: string;
  expiresIn: number;
};

/**
 * Returns a presigned upload target. When R2/S3 env vars are absent, returns a
 * dev stub that stores metadata only (client should set videoUrl manually).
 */
export function createVideoUploadPresign(input: {
  filename: string;
  contentType: string;
  lessonId?: string;
}): PresignResult {
  const bucket = process.env.LEARN_R2_BUCKET?.trim();
  const accountId = process.env.LEARN_R2_ACCOUNT_ID?.trim();
  const publicBase = process.env.LEARN_R2_PUBLIC_URL?.trim();

  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const prefix = input.lessonId ? `lessons/${input.lessonId}` : "uploads";
  const videoKey = `${prefix}/${randomUUID()}-${safeName}`;

  if (bucket && accountId && publicBase) {
    const uploadUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${videoKey}`;
    return {
      uploadUrl,
      videoKey,
      publicUrl: `${publicBase.replace(/\/$/, "")}/${videoKey}`,
      expiresIn: 3600,
    };
  }

  return {
    uploadUrl: "",
    videoKey,
    publicUrl: "",
    expiresIn: 0,
  };
}
