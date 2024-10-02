import ocClient from "../construct.ts";

try {
  await ocClient.contextList();
} catch (error) {
  console.error("Error fetching context list:", error);
}
