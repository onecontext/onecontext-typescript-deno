import {ocClient} from "../construct.ts";

try {
  const out = await ocClient.deleteContext({ contextName: "livedemo" });
  console.log(out)
} catch (error) {
  console.error("Error deleting context.");
}
