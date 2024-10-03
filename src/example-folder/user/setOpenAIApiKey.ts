import ocClient from "../construct.ts";

try {
  await ocClient.setOpenAIApiKey({
    openAIApiKey: "your-openai-api-key",
  });
} catch (error) {
  console.error("Error setting key:", error);
}
