import ocClient from "../construct.ts";

try {
  const result = await ocClient.contextGet(
    {
      "contextName": "lots",
      "metadataFilters": {
        $and: [{ age: { $eq: 30 } }, { name: { $contains: "ross" } }],
      },
      "limit": 5,
      "includeEmbedding": false,
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
