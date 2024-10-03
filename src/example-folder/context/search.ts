import ocClient from "./../construct.ts";
import { zodToJsonSchema } from "npm:zod-to-json-schema";
import { z } from "npm:zod@3.23.8";
import type {JsonSchemaType} from "./../../types/inputs.ts";

try {
  const candidate = z.object({
    title: z.string().describe("a title of a 1970s rockband"),
    lyrics: z.string().describe("lyrics to their absolute banger of a song"),
  });

  // @ts-ignore 
  const jsonCandidate: JsonSchemaType = zodToJsonSchema(candidate);

  if (!jsonCandidate) {
    throw new Error("Failed to generate the Json Structured Output");
  }

  const output = await ocClient.contextSearch(
    {
      "query": "return chunks relating to rockbands",
      "contextName": "counsel",
      "metadataFilters": {
        $and: [{ year: { $eq: 1970 } }, { label: { $contains: "columbia" } }],
      },
      "topK": 20,
      "semanticWeight": 0.3,
      "fullTextWeight": 0.7,
      "rrfK": 50,
      "includeEmbedding": false,
      "structuredOutputSchema": jsonCandidate,
    },
  );
  
  console.log("Chunks: ", output.chunks)
  console.log("Output: ", output.output)
  
} catch (error) {
  console.error("Error searching context.", error);
}
