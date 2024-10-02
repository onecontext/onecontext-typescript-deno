import { OneContextClient } from "./../src/mod.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import "jsr:@std/dotenv/load";

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

async function consumeResponse(response: Response) {
  await response.text();
}

const testContextName1 = "deno-test-context-files";
const testContextName2 = "deno-test-context-directory";
const testFilesDir = "./test/files";

async function waitForProcessing(contextName: string) {
  const maxAttempts = 6;
  const waitTime = 20000;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const listResult = await ocClient.listFiles({ contextName });
    assertEquals(listResult.ok, true);
    const listData = await listResult.json();
    assertExists(listData);

    if (listData.files.every((file: any) => file.status === "COMPLETED")) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  throw new Error(`File processing timed out for context ${contextName}`);
}

async function performSearch(contextName: string, metadataFilters?: any) {
  const searchResult = await ocClient.contextSearch({
    query: "test content",
    contextName,
    topK: 5,
    semanticWeight: 0.5,
    fullTextWeight: 0.5,
    rrfK: 10,
    includeEmbedding: false,
    metadataFilters,
  });
  assertEquals(searchResult.ok, true);
  const searchData = await searchResult.json();
  console.log({ searchData });
  assertExists(searchData);
  assertEquals(searchData.length > 0, true);
}

async function performGetChunks(contextName: string, metadataFilters?: any) {
  const getResult = await ocClient.contextGet({
    contextName,
    limit: 5,
    includeEmbedding: false,
    metadataFilters,
  });
  assertEquals(getResult.ok, true);
  const getData = await getResult.json();
  console.log({ getData });
  assertExists(getData);
  return getData;
}

Deno.test("Context Operations", async (t) => {
  let contextCreated1 = false;
  let contextCreated2 = false;

  try {
    await t.step("uploadFiles method", async () => {
      const createResult = await ocClient.createContext({
        contextName: testContextName1,
      });
      assertEquals(createResult.ok, true);
      const createData = await createResult.json();
      assertExists(createData);
      contextCreated1 = true;

      const validFiles = [];
      for await (const file of Deno.readDir(testFilesDir)) {
        if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
          validFiles.push(file);
        }
      }
      const filePaths = validFiles.map((file) => ({
        path: `${testFilesDir}/${file.name}`,
      }));

      const uploadResult = await ocClient.uploadFiles({
        contextName: testContextName1,
        stream: false,
        files: filePaths,
        metadataJson: {
          "testString": "string",
          "testArray": ["testArrayElement1", "testArrayElement2"],
          "testInt": 123,
          "testBool": true,
          "testFloat": 1.4,
        },
        maxChunkSize: 500,
      });

      assertEquals(uploadResult.ok, true);
      const uploadData = await uploadResult.json();
      assertExists(uploadData);

      await waitForProcessing(testContextName1);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await performSearch(testContextName1);
      await performSearch(testContextName1, {
        $and: [{
          "testString": { "$eq": "string" },
        }, {
          "testArray": { "$contains": "testArrayElement1" },
        }, {
          "testInt": { "$eq": 123 },
        }, {
          "testBool": { "$eq": true },
        }, {
          "testFloat": { "$eq": 1.4 },
        }],
      });
      await performGetChunks(testContextName1);
      const noResultsData = await performGetChunks(testContextName1, {
        $and: [{
          "testString": { "$eq": "notWhatWeWant" },
        }],
      });
      assertEquals(noResultsData.length, 0);
    });

    await t.step("uploadDirectory method", async () => {
      const createResult = await ocClient.createContext({
        contextName: testContextName2,
      });
      assertEquals(createResult.ok, true);
      const createData = await createResult.json();
      assertExists(createData);
      contextCreated2 = true;

      const uploadResult = await ocClient.uploadDirectory({
        contextName: testContextName2,
        directory: testFilesDir,
        metadataJson: {
          "testString": "string",
          "testArray": ["testArrayElement1", "testArrayElement2"],
          "testInt": 123,
          "testBool": true,
          "testFloat": 1.4,
        },
        maxChunkSize: 500,
      });
      assertEquals(uploadResult.ok, true);
      const uploadData = await uploadResult.json();
      assertExists(uploadData);

      await waitForProcessing(testContextName2);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await performSearch(testContextName2);
      await performSearch(testContextName2, {
        $and: [{
          "testString": { "$eq": "string" },
        }, {
          "testArray": { "$contains": "testArrayElement1" },
        }, {
          "testInt": { "$eq": 123 },
        }, {
          "testBool": { "$eq": true },
        }, {
          "testFloat": { "$eq": 1.4 },
        }],
      });
      await performGetChunks(testContextName2);
      const noResultsData = await performGetChunks(testContextName2, {
        $and: [{
          "testString": { "$eq": "notWhatWeWant" },
        }],
      });
      assertEquals(noResultsData.length, 0);
    });

    await t.step("context list method", async () => {
      const listResult = await ocClient.contextList();
      assertEquals(listResult.ok, true);
      const listData = await listResult.json();
      assertExists(listData);
    });
  } finally {
    // Cleanup contexts if they were created
    if (contextCreated1) {
      const deleteResponse = await ocClient.deleteContext({
        contextName: testContextName1,
      });
      await consumeResponse(deleteResponse);
    }
    if (contextCreated2) {
      const deleteResponse = await ocClient.deleteContext({
        contextName: testContextName2,
      });
      await consumeResponse(deleteResponse);
    }
  }
});
