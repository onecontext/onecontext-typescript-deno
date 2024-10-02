import ocClient from "../construct.ts";

try {
  await ocClient.createContext({ contextName: "deno" });
} catch (error) {
  console.error("Error creating context.", error);
}
