import {ocClient} from "../../construct.ts";

try {
  await ocClient.getDownloadUrl({
    fileId: "7294765e-1e77-4994-9b34-d87232a3cd58",
  });
} catch (error) {
  console.error("Error fetching context list:", error);
}
