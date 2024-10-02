import ocClient from "../../../construct.ts";
import { join } from "https://deno.land/std/path/mod.ts";

let filePathArray: Array<string> = [];

const pathArray = async (
  { directoryPath, numFiles }: { directoryPath: string; numFiles: number },
): Promise<string[]> => {
  try {
    const validFiles = [];
    for await (const file of Deno.readDir(directoryPath)) {
      if (
        file.name.endsWith(".pdf") || file.name.endsWith(".docx") ||
        file.name.endsWith(".txt")
      ) {
        validFiles.push(file);
      }
    }

    return validFiles.map((file) => (join(directoryPath, file.name))).slice(
      0,
      numFiles,
    );
  } catch (err) {
    console.error("Unable to scan directory:", err);
    return [];
  }
};

try {
  const directoryPath = "/Users/rossmurphy/GitHub/ctxc/context_eval/data/txt/";
  const filePathArray = await pathArray({ directoryPath, numFiles: 10 });
  const res = await ocClient.uploadFiles({
    files: filePathArray.map((path: string) => ({ path })),
    contextName: "dummy",
    stream: false,
    maxChunkSize: 200,
  });

  if (res.ok) {
    await res.json().then((data: any) =>
      console.log("File(s) successfully uploaded:", data)
    );
  } else {
    console.error("Error uploading files.");
  }
} catch (error) {
  console.error("Error uploading files:", error);
}