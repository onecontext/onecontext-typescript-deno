import ocClient from "../../../construct.ts";

try {
  const res = await ocClient.uploadFiles({
    files: [{
      path:
        "/Users/rossmurphy/embedding_example/embedpdf/attention_is_all_you_need.pdf",
    }],
    contextName: "deno",
    stream: false,
    maxChunkSize: 400,
  });

  if (res.ok) {
    await res.json().then((data: any) =>
      console.log("File(s) successfully uploaded:", data)
    );
  } else {
    console.error("Error uploading files.");
  }
} catch (error) {
  console.error("Error uploading files:", error);
}
