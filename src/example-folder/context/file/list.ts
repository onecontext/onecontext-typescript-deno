import ocClient from "../../construct.ts";

try {
  const result = await ocClient.listFiles({ contextName: "deno" });
  if (result.ok) {
    await result.json().then((data: any) =>
      console.log(`Files for context:`, data)
    );
  } else {
    console.error("Error fetching context list");
  }
} catch (error) {
  console.error("Error fetching context list:", error);
}
