import { z } from "https://deno.land/x/zod/mod.ts";
export const uploadParamsResponse = z.object({
  presignedUrl: z.string().url(),
  expiresAt: z.string(),
  fileId: z.string().uuid(),
  gcsUri: z.string(),
});

export const generatePresignedResponseSchema = z.array(uploadParamsResponse);

export type GeneratePresignedResponse = z.infer<
  typeof generatePresignedResponseSchema
>;
