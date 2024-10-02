import ocClient from "../construct.ts";

try {
  const result = await ocClient.contextList();
  if (result.ok) {
    await result.json().then((data: any) => console.log("Context list:", data));
  } else {
    console.error("Error fetching context list");
  }
} catch (error) {
  console.error("Error fetching context list:", error);
}
