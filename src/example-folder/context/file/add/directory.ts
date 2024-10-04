import {ocClient} from "../../../construct.ts";

try {
  const out = await ocClient.uploadDirectory({
    directory: "/Users/rossmurphy/embedding_example/embedpdf/",
    contextName: "go",
    maxChunkSize: 400,
  });
  console.log(out)
} catch (error) {
  console.error("Error fetching context list:", error);
}
