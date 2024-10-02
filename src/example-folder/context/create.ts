import ocClient from "../construct.ts";

try {
  const result = await ocClient.createContext({ contextName: "deno" });
  if (result.ok) {
    await result.json().then((data: any) =>
      console.log("Context created:", data)
    );
  } else {
    console.error("Error creating context.");
  }
} catch (error) {
  console.error("Error creating context.", error);
}
