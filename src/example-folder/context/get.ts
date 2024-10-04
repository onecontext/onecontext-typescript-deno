import {ocClient} from "../construct.ts";
import { z } from "npm:zod@3.23.8";

try {
  const candidate = z.object({
    title: z.string().describe('the title of the song'),
    lyrics: z.string().describe('lyrics to their absolute banger of a song'),
    trees: z.array(z.string()).describe('a list of trees that the band has planted'),
  }).describe('a candidate for the best rock band ever');
  
  const out = await ocClient.contextGet(
    {
      "contextName": "lots",
      // "metadataFilters": {
      //   $and: [{ age: { $eq: 30 } }, { name: { $contains: "ross" } }],
      // },
      "limit": 5,
      "includeEmbedding": false,
      "structuredOutputRequest": {structuredOutputSchema: candidate, model: "gpt-4o-mini"},
    },
  );
  console.log(out)
} catch (error) {
  console.error("Error searching context.", error);
}
