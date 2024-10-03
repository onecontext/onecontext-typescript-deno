import ocClient from "../construct.ts";

try {
  const out = await ocClient.contextList();
  console.log(out)
} catch (error) {
  console.error("Error fetching context list:", error);
}
