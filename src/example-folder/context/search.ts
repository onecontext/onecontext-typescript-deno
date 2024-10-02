import ocClient from "./../construct.ts";

try {
  const result = await ocClient.contextSearch(
    {
      "query":
        "generate me a lasagna recipe based on the chunks in the context.",
      "contextName": "ross",
      "metadataFilters": {
        $and: [{ age: { $eq: 30 } }, { name: { $contains: "ross" } }],
      },
      "topK": 5,
      "semanticWeight": 0.3,
      "fullTextWeight": 0.7,
      "rrfK": 50,
      "includeEmbedding": false,
      "structuredOutputSchema": {
        type: "object",
        properties: {
          song: { type: "string" },
        },
      },
    },
  );
  if (result.ok) {
    await result.json().then((data: any) =>
      console.log("Search results:", data)
    );
  } else {
    console.error("Error searching context.");
  }
} catch (error) {
  console.error("Error searching context.", error);
}
