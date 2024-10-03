import ocClient from "../../../construct.ts";

try {
  const out = await ocClient.uploadFiles({
    files: [{
      path:
        "/Users/rossmurphy/embedding_example/embedpdf/attention_is_all_you_need.pdf",
    }],
    contextName: "deno",
    maxChunkSize: 400,
  });
  console.log(out)
} catch (error) {
  console.error("Error uploading files:", error);
}
