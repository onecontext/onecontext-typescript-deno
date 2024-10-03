import ocClient from "../construct.ts";

try {
  const out = await ocClient.contextGet(
    {
      "contextName": "lots",
      // "metadataFilters": {
      //   $and: [{ age: { $eq: 30 } }, { name: { $contains: "ross" } }],
      // },
      "limit": 5,
      "includeEmbedding": false,
    },
  );
  console.log(out)
} catch (error) {
  console.error("Error searching context.", error);
}
