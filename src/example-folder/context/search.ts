import { StructuredOutputModelEnum } from "../../types/inputs.ts";
import {ocClient} from "../construct.ts";
import { z } from "npm:zod@3.23.8";

try {
  
  const candidate = z.object({
    title: z.string().describe('the title of the sea shanty'),
    lyrics: z.string().describe('some short lyrics to their absolute banger of a shanty. just give me a few lines.'),
  }).describe('a schema for a sea shanty');
  
  const model = StructuredOutputModelEnum.gpt_4o;

  const output = await ocClient.contextSearch(
    {
      "query": "tell me about rockbands",
      "contextName": "demo",
      // "metadataFilters": {
      //   $and: [{ year: { $eq: 1970 } }, { label: { $contains: "columbia" } }],
      // },
      "topK": 10,
      "semanticWeight": 0.3,
      "fullTextWeight": 0.7,
      "rrfK": 50,
      "includeEmbedding": false,
      "structuredOutputRequest": {structuredOutputSchema: candidate, model: model, prompt: "Produce this sea shanty"},
    },
  );
  
  // console.log("Chunks: ", output.chunks)
  console.log("Output: ", output.output)
  
} catch (error) {
  console.error("Error searching context.", error);
}
