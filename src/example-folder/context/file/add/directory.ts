import ocClient from "../../../construct.ts";

try {
  const res = await ocClient.uploadDirectory({
    directory: "/Users/rossmurphy/embedding_example/embedpdf/",
    contextName: "deno",
    maxChunkSize: 400,
  });
  if (res.ok) {
    res.json().then((data: any) => console.log("Directory uploaded:", data));
  } else {
    console.error("Error uploading directory.");
  }
} catch (error) {
  console.error("Error fetching context list:", error);
}
