import ocClient from "../construct.ts";

try {
  const result = await ocClient.deleteContext({ contextName: "livedemo" });
  if (result.ok) {
    await result.json().then((data: any) =>
      console.log("Deleted context:", data)
    );
  } else {
    console.error("Error deleting context.");
  }
} catch (error) {
  console.error("Error deleting context:", error);
}
