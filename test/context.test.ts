import {
  OneContextClient,
  type ChunkOperationResponse,
  type StructuredOutputRequestType,
  type MetadataFilters, utils
} from "./../src/mod.ts";
import {assertEquals, assertExists, assertGreater} from "jsr:@std/assert";
import "jsr:@std/dotenv/load";
import * as uuid from "jsr:@std/uuid";
import {z} from "npm:zod@3.23.8";

const API_KEY = Deno.env.get("ONECONTEXT_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const BASE_URL = Deno.env.get("BASE_URL");

if (!API_KEY || !OPENAI_API_KEY) {
  console.error(
    "Missing required environment variables. Please check your .env file.",
  );
  Deno.exit(1);
}

const ocClient = new OneContextClient({
  apiKey: API_KEY,
  openAiKey: OPENAI_API_KEY,
  baseUrl: BASE_URL,
});

async function _consumeResponse(response: Response) {
  await response.text();
}

const testFilesDir = "./test/files/";

async function waitForProcessing(contextName: string) {
  const maxAttempts = 10;
  const waitTime = 10000;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const listResult = await ocClient.listFiles({contextName});

    const files = listResult.files;

    if (files.every((file: any) => file.status === "COMPLETED")) {
      return;
    }

    const failedFiles = files.filter((file: any) => file.status === "FAILED");

    if (failedFiles.length > 0) {
      console.error(
        `File processing failed for the following files in context ${contextName}:`,
      );
      failedFiles.forEach((file: any) => {
        console.error(`- ${file.name}`);
      });
      throw new Error(
        `File processing failed for ${failedFiles.length} file(s) in context ${contextName}`,
      );
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  throw new Error(`File processing timed out for context ${contextName}`);
}

async function performSearch({query, topK, contextName, metadataFilters, structuredOutputRequest}: {
  query?: string,
  topK? : number,
  contextName: string,
  metadataFilters?: MetadataFilters,
  structuredOutputRequest?: StructuredOutputRequestType
}): Promise<ChunkOperationResponse> {
  return await ocClient.contextSearch({
    query: query ?? "test content",
    contextName,
    topK: topK ?? 5,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 10,
    includeEmbedding: false,
    metadataFilters,
    structuredOutputRequest,
  });
}

async function performGetChunks({contextName, metadataFilters, structuredOutputRequest}: {
                                  contextName: string,
                                  metadataFilters?: MetadataFilters,
                                  structuredOutputRequest?: StructuredOutputRequestType
                                }
): Promise<ChunkOperationResponse> {
  return await ocClient.contextGet({
    contextName,
    limit: 5,
    includeEmbedding: false,
    metadataFilters,
    structuredOutputRequest,
  });
}

Deno.test("Upload Files Operations", async (t) => {
  let filesContextCreated = false;
  const filesContextName = "deno-test-context-files" + "-" +
    String(uuid.v1.generate());

  await t.step("Create Context", async () => {
    const createResult = await ocClient.createContext({
      contextName: filesContextName,
    });
    assertExists(createResult);
    filesContextCreated = true;
  });

  await t.step("Upload Files", async () => {
    const validFiles = [];
    for await (const file of Deno.readDir(testFilesDir)) {
      if (
        file.name.endsWith(".pdf") || file.name.endsWith(".docx") ||
        file.name.endsWith(".txt")
      ) {
        validFiles.push(file);
      }
    }
    const filePaths = validFiles.map((file) => ({
      path: `${testFilesDir}/${file.name}`,
    }));

    const uploadResult = await ocClient.uploadFiles({
      contextName: filesContextName,
      files: filePaths,
      metadataJson: {
        "testString": "string",
        "testArray": ["testArrayElement1", "testArrayElement2"],
        "testInt": 123,
        "testBool": true,
        "testFloat": 1.4,
      },
      maxChunkSize: 200,
    });

    assertExists(uploadResult);
  });

  await t.step("Wait for Files To Process", async () => {
    try {
      await waitForProcessing(filesContextName);
    } catch (error) {
      throw new Error(`Error waiting for files to process: ${error}`);
    }
  });

  await t.step("Perform a vanilla search", async () => {
    const result = await performSearch({contextName: filesContextName});
    assertGreater(result.chunks.length, 0);
  });

  await t.step("Perform a search with metadata filters", async () => {
    const result = await performSearch({contextName: filesContextName, metadataFilters: {
      $and: [{
        "testString": {"$eq": "string"},
      }, {
        "testArray": {"$contains": "testArrayElement1"},
      }, {
        "testInt": {"$eq": 123},
      }, {
        "testBool": {"$eq": true},
      }, {
        "testFloat": {"$eq": 1.4},
      }],
    }});
    assertGreater(result.chunks.length, 0);
  });

  await t.step(
    "Perform a Get Chunks Operation, without metadata",
    async () => {
      const resultsData = await performGetChunks({contextName: filesContextName});
      assertGreater(resultsData.chunks.length, 0);
    },
  );

  await t.step(
    "Perform a get Chunks Operation, with metadata filters which should result in no chunks",
    async () => {
      const noResultsData = await performGetChunks({contextName: filesContextName, metadataFilters : {
        $and: [{
          "testString": {"$eq": "notWhatWeWant"},
        }],
      }});
      assertEquals(noResultsData.chunks.length, 0);
    },
  );

  await t.step("Clean up, delete context", async () => {
    if (filesContextCreated) {
      const deleteResult = await ocClient.deleteContext({
        contextName: filesContextName,
      });
      assertExists(deleteResult);
    } else return;
  });
});

Deno.test("Upload Directory Operations", async (t) => {
  let directoryContextCreated = false;
  const directoryContextName = "deno-test-context-directory" + "-" +
    String(uuid.v1.generate());

  await t.step("Create Context", async () => {
    const createResult = await ocClient.createContext({
      contextName: directoryContextName,
    });
    assertExists(createResult);
    directoryContextCreated = true;
    return;
  });

  await t.step("Upload a Directory of Files", async () => {
    const uploadResult = await ocClient.uploadDirectory({
      directory: testFilesDir,
      contextName: directoryContextName,
      metadataJson: {
        "testString": "string",
        "testArray": ["testArrayElement1", "testArrayElement2"],
        "testInt": 123,
        "testBool": true,
        "testFloat": 1.4,
      },
      maxChunkSize: 200,
    });
    assertExists(uploadResult);
    return;
  });

  await t.step("Wait for processing of files from directory", async () => {
    await waitForProcessing(directoryContextName);
    return;
  });

  await t.step("Perform a vanilla search against context", async () => {
    const result = await performSearch({contextName: directoryContextName});
    assertGreater(result.chunks.length, 0);
    return;
  });

  await t.step(
    "Perform a search with metadata filters against context",
    async () => {
      const result = await performSearch({contextName: directoryContextName,  metadataFilters: {
        $and: [{
          "testString": {"$eq": "string"},
        }, {
          "testArray": {"$contains": "testArrayElement1"},
        }, {
          "testInt": {"$eq": 123},
        }, {
          "testBool": {"$eq": true},
        }, {
          "testFloat": {"$eq": 1.4},
        }],
      }});
      assertGreater(result.chunks.length, 0);
      return;
    },
  );

  await t.step(
    "Perform a Search Operation, with a structured output",
    async () => {
      const result = await performSearch({
        contextName: directoryContextName, structuredOutputRequest: {
          structuredOutputSchema: z.object({lyrics: z.string()}),
          model: "gpt-4o-mini",
          prompt: "Produce the lyrics to a sea shanty"
        }
      });
      assertGreater(result.chunks.length, 0);
      assertExists(result.chunks[0].content);
      assertExists(result.output.lyrics)
      console.log(result.output);
      return;
    },
  );

  await t.step(
    "Perform a Get Chunks Operation, without metadata",
    async () => {
      const result = await performGetChunks({contextName: directoryContextName});
      assertGreater(result.chunks.length, 0);
      return;
    },
  );

  await t.step(
    "Perform a Get Chunks Operation, with a structured output",
    async () => {
      const result = await performGetChunks({
        contextName: directoryContextName, structuredOutputRequest: {
          structuredOutputSchema: z.object({lyrics: z.string()}),
          model: "gpt-4o-mini",
          prompt: "Produce the lyrics to a sea shanty"
        }
      });
      assertGreater(result.chunks.length, 0);
      assertExists(result.chunks[0].content);
      assertExists(result.output.lyrics)
      console.log(result.output);
      return;
    },
  );
  
  await t.step(
    "Perform a Get Chunks operation, with a metadata filter which should return no chunks",
    async () => {
      const noResultsData = await performGetChunks({contextName: directoryContextName, metadataFilters: {
        $and: [{
          "testString": {"$eq": "notWhatWeWant"},
        }],
      }});
      assertEquals(noResultsData.chunks.length, 0);
      return;
    },
  );

  await t.step("Clean up and delete", async () => {
    if (directoryContextCreated) {
      const deleteResult = await ocClient.deleteContext({
        contextName: directoryContextName,
      });
      assertExists(deleteResult);
    } else return;
  });
});
