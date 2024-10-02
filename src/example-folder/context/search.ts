import ocClient from "./../construct.ts";
import { zodToJsonSchema } from "npm:zod-to-json-schema";
import { z } from "https://deno.land/x/zod/mod.ts";

try {
  const candidate = z.object({
    hi: z.string().describe("a title of a 1970s rockband"),
  });

  // deno-lint-ignore TS2589
  // @ts-ignore -- type checking will throw infinite recursion error here
  // this is because there are a LOT of types zodToJsonSchema can compose...
  // this is ~fine...
  const jsonCandidate = zodToJsonSchema(candidate);

  if (!jsonCandidate) {
    throw new Error("Failed to generate the Json Structured Output");
  }

  console.log(`Going to try and generate the Json Structured Output`, {
    jsonCandidate,
  });

  const result = await ocClient.contextSearch(
    {
      "query":
        "generate me a lasagna recipe based on the chunks in the context.",
      "contextName": "counsel",
      // "metadataFilters": {
      //   $and: [{ age: { $eq: 30 } }, { name: { $contains: "ross" } }],
      // },
      "topK": 20,
      "semanticWeight": 0.3,
      "fullTextWeight": 0.7,
      "rrfK": 50,
      "includeEmbedding": false,
      "structuredOutputSchema": jsonCandidate,
    },
  );
  if (result.ok) {
    await result.json().then((data: any) => console.log("Result:", data));
  } else {
    console.error("Error searching context.");
  }
} catch (error) {
  console.error("Error searching context.", error);
}
