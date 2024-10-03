import ocClient from "../construct.ts";

try {
  const out = await ocClient.createContext({ contextName: "example" });
  console.log(out)
} catch (error) {
  console.error("Error creating context.", error);
}
