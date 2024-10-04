import {ocClient} from "../../construct.ts";

try {
  await ocClient.listFiles({ contextName: "deno" });
} catch (error) {
  console.error("Error fetching context list:", error);
}
