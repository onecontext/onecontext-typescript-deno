import { OneContextClient } from "./../mod.ts";
import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("ONECONTEXT_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const BASE_URL = Deno.env.get("BASE_URL");
const BYPASS = Deno.env.get("BYPASS");

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
  bypass: BYPASS || undefined,
});

export {ocClient};
