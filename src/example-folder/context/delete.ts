import ocClient from "../construct.ts";

try {
  await ocClient.deleteContext({ contextName: "livedemo" });
} catch (error) {
  console.error("Error deleting context.");
}
