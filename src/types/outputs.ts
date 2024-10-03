import { z } from "npm:zod@3.23.8";

export const FlexibleSchema: z.ZodAny = z.any()

export type FlexibleType = z.infer<typeof FlexibleSchema>;

export const uploadParamsResponseSchema: z.ZodType<{
  presignedUrl: string;
  expiresAt: string;
  fileId: string;
  gcsUri: string;
}> = z.object({
  presignedUrl: z.string().url(),
  expiresAt: z.string(),
  fileId: z.string().uuid(),
  gcsUri: z.string(),
});

export type UploadParamsResponse = z.infer<typeof uploadParamsResponseSchema>;

export const fileResponseSchema: z.ZodType<{
  id: string;
  date_created: string;
  status: string;
  name: string;
  context_name: string;
  context_id: string;
  metadata_json?: Record<string, string | number | boolean | null>;
  download_url?: string;
}> = z.object({
  id: z.string(),
  date_created: z.string(),
  status: z.string(),
  name: z.string(),
  context_name: z.string(),
  context_id: z.string(),
  metadata_json: z.record(z.string(), z.union([z.string(),z.number(),z.boolean(),z.null()])).optional(),
  download_url: z.string().optional(),
});

export type FileResponse = z.infer<typeof fileResponseSchema>;

const listFilesResponseSchema: z.ZodType<{
  files: FileResponse[];
}> = z.object({
  files: z.array(fileResponseSchema), // Ideally, replace z.any() with a more specific schema for the items in the files array.
});

export type ListFilesResponse = z.infer<typeof listFilesResponseSchema>;

const contextCreateResponseSchema: z.ZodType<{
  id: string;
  name: string;
}> = z.object({
  id: z.string(),
  name: z.string(),
});

export type ContextCreateResponse = z.infer<typeof contextCreateResponseSchema>;


const chunkSchema: z.ZodType<{
  id: string;
  content: string;
  user_id: string;
  file_name: string;
  file_id: string;
  context_id: string;
  metadata_json?: Record<string, number | boolean | string | null>;
  embedding?: number[];
  semantic_score?: number 
  fulltext_score?: number
  combined_score?: number
}> = z.object({
  id: z.string(),
  content: z.string(),
  user_id: z.string(),
  file_name: z.string(),
  file_id: z.string(),
  context_id: z.string(),
  metadata_json: z.record(z.string(), z.union([z.string(),z.number(),z.boolean(),z.null()])).optional(),
  embedding: z.array(z.number()).optional(),
  semantic_score: z.number().optional(),
  fulltext_score: z.number().optional(),
  combined_score: z.number().optional()
});

export type Chunk = z.infer<typeof chunkSchema>;

const ChunkOperationResponseSchema: z.ZodType<{
  chunks: Chunk[]; 
  output?: FlexibleType;
}> = z.object({
  chunks: z.array(chunkSchema),
  output: z.any(),
});

export type ChunkOperationResponse = z.infer<typeof ChunkOperationResponseSchema>;
