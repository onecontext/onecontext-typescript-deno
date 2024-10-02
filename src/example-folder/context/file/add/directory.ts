import ocClient from "../../../construct.ts";

try {
  await ocClient.uploadDirectory({
    directory: "/Users/rossmurphy/embedding_example/embedpdf/",
    contextName: "go",
    maxChunkSize: 400,
  });
} catch (error) {
  console.error("Error fetching context list:", error);
}
