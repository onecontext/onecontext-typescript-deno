import { OneContextClient, utils, type StructuredOutputModelType, type ChunkOperationResponse } from "./../mod.ts";
import type { inputTypes, outputTypes } from "./../mod.ts";
import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("ONECONTEXT_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const BASE_URL = Deno.env.get("BASE_URL");

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error(
    "Missing required environment variables. Please check your .env file.",
  );
  Deno.exit(1);
}

const ocClient = new OneContextClient({
  apiKey: API_KEY,
  openAiKey: OPENAI_API_KEY,
  baseUrl: BASE_URL || undefined,
});

export {ocClient, utils};
export type { inputTypes, outputTypes, StructuredOutputModelType, ChunkOperationResponse };
