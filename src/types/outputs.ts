import { z } from "https://deno.land/x/zod/mod.ts";

export const FlexibleResponseSchema = z
  .object({
    message: z.string(),
  })
  .passthrough();

export type FlexibleResponse = z.infer<typeof FlexibleResponseSchema>;

export const uploadParamsResponse = z.object({
  presignedUrl: z.string().url(),
  expiresAt: z.string(),
  fileId: z.string().uuid(),
  gcsUri: z.string(),
});

export const generatePresignedResponseSchema = z.array(uploadParamsResponse);

export const fileResponseSchema = z.object({
  id: z.string(),
  date_created: z.string(),
  status: z.string(),
  name: z.string(),
  context_name: z.string(),
  context_id: z.string(),
  metadata_json: z.record(z.string(), z.any()).nullable().default(null),
  download_url: z.string().optional(),
});

export type FileResponse = z.infer<typeof fileResponseSchema>;

export const listFilesResponseSchema = z.object({
  files: z.array(fileResponseSchema), // Ideally, replace z.any() with a more specific schema for the items in the files array.
});

export type ListFilesResponse = z.infer<typeof listFilesResponseSchema>;

export const contextCreateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type ContextCreateResponse = z.infer<typeof contextCreateResponseSchema>;

export type GeneratePresignedResponse = z.infer<
  typeof generatePresignedResponseSchema
>;

export const chunkSchema = z.object({
  id: z.string(),
  content: z.string(),
  user_id: z.string(),
  file_name: z.string(),
  file_id: z.string(),
  context_id: z.string(),
  metadata_json: z.record(z.string(), z.any()).nullable().default(null),
  embedding: z.any().nullable().default(null),
  semantic_score: z.number().nullable().default(null),
  fulltext_score: z.number().nullable().default(null),
  combined_score: z.number().nullable().default(null),
});

export const ChunksResponse = z.array(chunkSchema);

export const ChunkOperationResponse = z.object({
  chunks: ChunksResponse,
  output: z.any(),
});

export type ChunkOperationResponse = z.infer<typeof ChunkOperationResponse>;
