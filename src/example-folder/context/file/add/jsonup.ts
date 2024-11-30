import {ocClient} from "../../../construct.ts";
import { join } from "jsr:@std/path@1";

const MAX_BATCH_SIZE = 4 * 1024 * 1024; // 4MB

const createTempDir = async (): Promise<string> => {
  const tempDir = join(Deno.cwd(), "tmp");
  await Deno.mkdir(tempDir, { recursive: true });
  return tempDir;
};

const cleanupTempDir = async (tempDir: string): Promise<void> => {
  for await (const entry of Deno.readDir(tempDir)) {
    await Deno.remove(join(tempDir, entry.name));
  }
  await Deno.remove(tempDir);
};

const parseConversation = async (conversation: any, tempDir: string): Promise<{ fileName: string; metadataJson: Record<string, any>; size: number }[]> => {
  const filesArray: { fileName: string; metadataJson: Record<string, any>; size: number }[] = [];

  for (const message of conversation.messages) {
    const tempPath = join(tempDir, `${message.message_id}.txt`);
    await Deno.writeTextFile(tempPath, message.body);
    const fileInfo = await Deno.stat(tempPath);
    const { messages: _messages, ...metadataWithoutMessages } = conversation;
    filesArray.push({ fileName: `${message.message_id}.txt`, metadataJson: metadataWithoutMessages, size: fileInfo.size });
  }

  return filesArray;
};

const processBatch = async (batch: {
  fileName: string;
  metadataJson: Record<string, any>;
  size: number
}[]): Promise<void> => {
  const ocResponse = await ocClient.uploadFiles({
      files: batch.map((file: any) => ({path: join(Deno.cwd(), "tmp", file.fileName)})),
      contextName: "newtest",
      metadataJson: batch.map((file: any) => file.metadataJson),
    }
  );
};

const jParse = async ({ jPath }: { jPath: string }): Promise<void> => {
  const tempDir = await createTempDir();

  try {
    const out = await Deno.readTextFile(jPath);
    const parsed = JSON.parse(out);

    let currentBatch: { fileName: string; metadataJson: Record<string, any>; size: number }[] = [];
    let currentBatchSize = 0;

    for (const conversation of parsed) {
      const filesArray = await parseConversation(conversation, tempDir);

      for (const file of filesArray) {
        if (currentBatchSize + file.size > MAX_BATCH_SIZE) {
          await processBatch(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
        currentBatch.push(file);
        currentBatchSize += file.size;
      }
    }

    if (currentBatch.length > 0) {
      await processBatch(currentBatch);
    }

    console.log("All batches processed successfully");
  } catch (err) {
    console.error("Error processing files:", err);
  } finally {
    await cleanupTempDir(tempDir);
  }
};

try {
  const jPath = "path/goes/here";
  await jParse({ jPath });
} catch (error) {
  console.error("Error in main execution:", error);
}