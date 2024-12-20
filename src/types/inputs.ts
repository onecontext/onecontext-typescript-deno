import { z } from "npm:zod@3.23.8";
import type {FlexibleType} from "./outputs.ts";

export const StructuredOutputModelEnum: {
  readonly gpt_4o: "gpt-4o";
  readonly gpt_4o_mini: "gpt-4o-mini";
  readonly claude_35: "claude-35";
} = {
  "gpt_4o" : "gpt-4o",
  "gpt_4o_mini" : "gpt-4o-mini",
  "claude_35" : "claude-35",
} as const
export type StructuredOutputModelType = typeof StructuredOutputModelEnum[keyof typeof StructuredOutputModelEnum];

export const StructuredOutputModelSchema: z.ZodEnum<[StructuredOutputModelType, ...StructuredOutputModelType[]]> = z.enum([
  StructuredOutputModelEnum.gpt_4o,
  StructuredOutputModelEnum.gpt_4o_mini,
  StructuredOutputModelEnum.claude_35
]);

export const StructuredOutputRequest: z.ZodType<{
  structuredOutputSchema: FlexibleType;
  prompt?: string;
  model?: StructuredOutputModelType; 
}> = z.object({
  structuredOutputSchema: z.record(z.unknown()),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  model: StructuredOutputModelSchema.default(StructuredOutputModelEnum.gpt_4o_mini),
});

export type StructuredOutputRequestType = z.infer<typeof StructuredOutputRequest>;

const MetadataFilters: z.ZodType<{
  [k: string]: FlexibleType 
}> = z.record(z.string(), z.any());
export type MetadataFilters = z.infer<typeof MetadataFilters>;

/**
 * Schema for OpenAI API parameters.
 */
const _OpenAISchema = z.object({
  model: z.string().default("gpt-3.5-turbo").optional(),
});

/**
 * Schema for setting the OpenAI API key.
 */
const SetOpenAIKeySchema: z.ZodType<{
  openAIApiKey: string;
}> = z.object({
  openAIApiKey: z.string().refine((val: any) => val.trim() !== "", {
    message: "OpenAI API key cannot be empty",
  }),
});
export type SetOpenAIApiKeyType = z.infer<typeof SetOpenAIKeySchema>;

/**
 * Schema for deleting files from a context.
 */
const DeleteFileSchema: z.ZodType<{
  fileId: string;
}> = z.object({
  fileId: z.string().refine((val: string) => val.length > 0, {
    message: "File id cannot be empty",
  }),
});
export type DeleteFileType = z.infer<typeof DeleteFileSchema>;

/**
 * Schema for listing files in a context.
 */
const ListFilesSchema: z.ZodType<{
  contextName: string;
  skip?: number | undefined;
  limit?: number | undefined;
  sort?: string | undefined;
  metadataFilters?: MetadataFilters | undefined;
}> = z.object({
  contextName: z.string(),
  skip: z.number().default(0).optional(),
  limit: z.number().default(10).optional(),
  sort: z.string().default("date_created").optional(),
  metadataFilters: MetadataFilters.default({}).optional(),
});
export type ListFilesType = z.infer<typeof ListFilesSchema>;

/**
 * Schema for a file that's a path (gets converted to a readable stream)
 */
const FileSchema: z.ZodType<{
  path: string;
}> = z.object({
  path: z.string().refine((val) => val.trim() !== "", {
    message: "Path cannot be empty",
  }),
});
export type FileType = z.infer<typeof FileSchema>;

/**
 * Schema for creating a context
 */
const ContextCreateSchema: z.ZodType<{
  contextName: string;
}> = z.object({
  contextName: z.string().refine((val) => val.trim() !== "", {
    message: "Name for your context cannot be empty",
  }),
});
export type ContextCreateType = z.infer<typeof ContextCreateSchema>;

/**
 * Schema for deleting a context
 */
const ContextDeleteSchema: z.ZodType<{
  contextName: string;
}> = z.object({
  contextName: z.string().refine((val) => val.trim() !== "", {
    message: "Name of the context to delete cannot be empty",
  }),
});
export type ContextDeleteType = z.infer<typeof ContextDeleteSchema>;

/**
 * Schema for listing the contexts you have
 */
const _ListContext = z.object({});

/**
 * Schema for filtering a context, and defining the parameters for said filter
 */
const ContextGetSchema: z.ZodType<{
  contextName: string;
  metadataFilters?: MetadataFilters | undefined;
  limit?: number | null;
  includeEmbedding?: boolean | undefined;
  structuredOutputRequest?: StructuredOutputRequestType;
}> = z.object({
  contextName: z.string(),
  metadataFilters: MetadataFilters.default({}).optional(),
  structuredOutputRequest: StructuredOutputRequest.optional(),
  limit: z.union([
    z.number().refine((val) => val > 0, {
      message: "Limit must be greater than 0",
    }),
    z.null(),
  ]),
  includeEmbedding: z.boolean().default(false).optional(),
});
export type ContextGetType = z.infer<typeof ContextGetSchema>;

/**
 * A Structured Output Schema for LLMs
 * TODO: implement with the correct types based on: https://zod.dev/?id=json-type
 */
const literalSchema: z.ZodType<string | number | boolean | null> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);
// TODO make work with the above

const zodJsonSchema: z.ZodRecord<z.ZodString, z.ZodAny>  = z.record(z.string(), z.any())
export type JsonSchemaType = z.infer<typeof zodJsonSchema>;


/**
 * Schema for searching through a context, and defining the parameters for said search
 */
export const ContextSearchSchema: z.ZodType<{
  query: string;
  contextName: string;
  metadataFilters?: MetadataFilters | undefined;
  topK: number | null;
  semanticWeight?: number;
  fullTextWeight?: number;
  rrfK?: number;
  includeEmbedding?: boolean;
  structuredOutputRequest?: StructuredOutputRequestType; 
}> = z.object({
  query: z.string().refine((val) => val.trim() !== "", {
    message:
      "The query cannot be empty. If you want to just retrieve chunks without a query, try the ContextGet method!",
  }),
  contextName: z.string(),
  // TODO - add stricter type for this (it's on the backend, move it over here')
  metadataFilters: MetadataFilters.default({}).optional(),
  topK: z.union([
    z.number().refine((val) => val > 0, {
      message: "Top k must be greater than 0",
    }),
    z.null(),
  ]),
  semanticWeight: z.number().refine((val) => val >= 0 && val <= 1, {
    message: "Semantic weight must be between 0 and 1",
  }).default(0.5).optional(),
  fullTextWeight: z.number().refine((val) => val >= 0 && val <= 1, {
    message: "Full text weight must be between 0 and 1",
  }).default(0.5).optional(),
  rrfK: z.number().refine((val) => val > 0, {
    message: "rrfK must be greater than 0",
  }).default(60).optional(),
  includeEmbedding: z.boolean().default(false).optional(),
  structuredOutputRequest: z.any().optional(),
});
export type ContextSearchType = z.infer<typeof ContextSearchSchema>;

/**
 * Schema for uploading files to a context
 */
export const UploadFilesSchema: z.ZodType<{
  files: FileType[];
  contextName: string;
  metadataJson?: MetadataFilters[];
  maxChunkSize?: number;
}> = z.object({
  files: z.array(FileSchema),
  contextName: z.string().refine((val) => val.trim() !== "", {
    message: "Context name cannot be empty",
  }),
  metadataJson: z.array(MetadataFilters).optional(),
  maxChunkSize: z.number().refine((val) => val > 0, {
    message: "Max chunk size must be greater than 0",
  }).default(300).optional(),
});
export type UploadFilesType = z.infer<typeof UploadFilesSchema>;

/**
 * Schema for requesting a download url
 */
export const DownloadUrlRequestSchema: z.ZodType<{
  fileId: string;
}> = z.object({
  fileId: z.string(),
});
export type DownloadUrlType = z.infer<typeof DownloadUrlRequestSchema>;

/**
 * Schema for uploading an entire directory of files to a context
 */
export const UploadDirectorySchema: z.ZodType<{
  directory: string;
  contextName: string;
  metadataJson?: MetadataFilters;
  maxChunkSize?: number;
}> = z.object({
  directory: z.string().refine((val) => val.endsWith("/"), {
    message: "Directory must end with /",
  }),
  contextName: z.string().refine((val) => val.trim() !== "", {
    message: "Knowledge Base name cannot be empty",
  }),
  metadataJson: MetadataFilters.optional(),
  maxChunkSize: z.number().refine((val) => val > 0, {
    message: "Max chunk size must be greater than 0",
  }).default(600).optional(),
});
export type UploadDirectoryType = z.infer<typeof UploadDirectorySchema>;
