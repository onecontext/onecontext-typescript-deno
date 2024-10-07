import * as path from "jsr:@std/path@1";
import { basename, extname, join, relative } from "jsr:@std/path@1";
import type * as inputTypes from "./types/inputs.ts";
import type * as outputTypes from "./types/outputs.ts";
import * as utils from "./utils.ts";

/**
 * The object for interacting with the API
 * @param apiKey -  The API key for authentication.
 * @param openAiKey - Optional OpenAI API key.
 * @param baseUrl - The base URL for the OneContext API.
 * @returns - An instantiated client object.
 * @example
 * try {
 *   const ocClient = new OneContextClient({apiKey: API_KEY, openAiKey: OPENAI_API_KEY, baseUrl: BASE_URL});
 * } catch (error) {
 *   console.error('Error instantiating client', error);
 * }
 */
export class OneContextClient {
  private readonly apiKey: string;
  private baseUrl: string;
  private readonly openAiKey?: string;

  /**
   * Creates an instance of OneContextClient.
   * @private
   * @param apiKey - The API key for authentication.
   * @param openAiKey - Optional OpenAI API key.
   * @param baseUrl - The base URL for the OneContext API.
   */
  constructor(
    { apiKey, openAiKey, baseUrl }: {
      apiKey: string;
      openAiKey?: string;
      baseUrl?: string;
    },
  ) {
    this.apiKey = apiKey;
    this.openAiKey = openAiKey;
    this.baseUrl = baseUrl || "https://app.onecontext.ai/api/v5/";
  }

  /**
   * Makes a request to the OneContext API.
   * @private
   * @param endpoint - The API endpoint to request.
   * @param options - Additional options for the request.
   * @returns The response from the API.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(new URL(endpoint, this.baseUrl).toString(), {
      ...options,
      headers: {
        ...options.headers,
        "API-KEY": this.apiKey,
        "OPENAI-API-KEY": this.openAiKey || "",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Consume the body
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }

    return await response.json() as T;
  }

  /**
   * Creates a new context.
   * @param args - The arguments for creating a context.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.createContext({contextName: "contextName"})
   * } catch (error) {
   *   console.error('Error creating context.', error);
   * }
   */
  async createContext(
    args: inputTypes.ContextCreateType,
  ): Promise<outputTypes.ContextCreateResponse> {
    return await this.request("context", {
      method: "POST",
      body: JSON.stringify(args),
    });
  }

  /**
   * Deletes a context.
   * @param args - The arguments for deleting a context.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.deleteContext(
   *     {
   *       contextName: "contextName"
   *     }
   *   )
   * } catch (error) {
   *   console.error('Error deleting context :', error);
   * }
   */
  async deleteContext(
    args: inputTypes.ContextDeleteType,
  ): Promise<outputTypes.FlexibleType> {
    return await this.request(`context`, {
      method: "DELETE",
      body: JSON.stringify(args),
    });
  }

  /**
   * Lists all contexts.
   * @returns The response from the API containing the list of contexts.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.contextList()
   * } catch (error) {
   *   console.error('Error fetching list of contexts', error);
   * }
   */
  async contextList(): Promise<outputTypes.FlexibleType> {
    return await this.request("context", {
      method: "GET",
    });
  }

  /**
   * Searches within a context.
   * @param args - The arguments for searching a context.
   * @returns The response from the API containing the search results.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.contextSearch(
   *     {
   *       "query": "An example query you can use to search through all the data in your context",
   *       "contextName": "contextName",
   *       "metadataFilters": {$and : [{age: {$eq: 100}}, {name: {$contains: "an_old_person"}}]},
   *       "topK": 20,
   *       "semanticWeight": 0.5,
   *       "fullTextWeight": 0.5,
   *       "rrfK": 55,
   *       "includeEmbedding": false
   *     }
   *   )
   * } catch (error) {
   *   console.error('Error searching context.', error);
   * }
   */
  async contextSearch(
    args: inputTypes.ContextSearchType,
  ): Promise<outputTypes.ChunkOperationResponse> {
    if (args.structuredOutputRequest) {
      // cast it to the correct type using the helper from the utils
      // if passed a zod type, it will coerce it to jsonSchema
      // if passed a jsonSchema, it will leave it as is
      // it will also delete the top level description (see GRauch conversation)
      args.structuredOutputRequest = utils.castToStructuredOutputSchema({...args.structuredOutputRequest});
    }
    return await this.request("context/chunk/search", {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Filters within a context.
   * @param args - The arguments for returning chunks from a context.
   * @returns The response from the API containing the chunks.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.contextFilter(
   *     {
   *       "contextName": "contextName",
   *       "limit": 20,
   *       "metadataFilters": {$and : [{age: {$eq: 100}}, {name: {$contains: "an_old_person"}}]},
   *       "includeEmbedding": false
   *     }
   *   )
   * } catch (error) {
   *   console.error('Error searching context.', error);
   * }
   */
  async contextGet(
    args: inputTypes.ContextGetType,
  ): Promise<outputTypes.ChunkOperationResponse> {
    
    if (args.structuredOutputRequest) {
      // cast it to the correct type using the helper from the utils
      // if passed a zod type, it will coerce it to jsonSchema
      // if passed a jsonSchema, it will leave it as is
      // it will also delete the top level description (see GRauch conversation)
      args.structuredOutputRequest = utils.castToStructuredOutputSchema({...args.structuredOutputRequest});
    }
    return await this.request("context/chunk", {
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Deletes files.
   * @param args - The arguments for deleting a file.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   const result = await ocClient.deleteFile(
   *     {
   *       "fileId": "example_file_id",
   *     }
   *   )
   * } catch (error) {
   *   console.error('Error deleting file.', error);
   * }
   */
  async deleteFile(
    args: inputTypes.DeleteFileType,
  ): Promise<outputTypes.FlexibleType> {
    const renamedArgs = {
      fileId: args.fileId,
    };
    return await this.request("context/file", {
      method: "DELETE",
      body: JSON.stringify(renamedArgs),
    });
  }

  /**
   * Lists files in a context.
   * @param args - The arguments for listing files.
   * @returns The response from the API containing the list of files.
   */
  async listFiles(
    args: inputTypes.ListFilesType,
  ): Promise<outputTypes.ListFilesResponse> {
    return await this.request("context/file", {
      method: "POST",
      body: JSON.stringify(args),
    });
  }

  /**
   * Get a download URL for a particular file id.
   * @param args - The file id.
   * @returns A download url.
   */
  async getDownloadUrl(
    args: inputTypes.DownloadUrlType,
  ): Promise<outputTypes.FlexibleType> {
    return await this.request("context/file/presigned-download-url", {
      method: "POST",
      body: JSON.stringify(args),
    });
  }

  private async *fileGenerator(directory: string) {
    async function* walkDirectory(
      dir: string,
    ): AsyncGenerator<{ path: string; name: string }> {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory) {
          yield* walkDirectory(fullPath);
        } else if (entry.isFile) {
          const ext = extname(entry.name).toLowerCase();
          if ([".txt", ".pdf", ".docx", ".doc"].includes(ext)) {
            yield { path: fullPath, name: relative(directory, fullPath) };
          }
        }
      }
    }

    yield* walkDirectory(directory);
  }
  /**
   * Uploads a directory of files to a context.
   * @param args - The arguments for uploading a directory.
   * @returns The response from the API.
   * @example
   * @example
   * try {
   *  const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *  await ocClient.uploadDirectory({
   *    directory: "/Path/to/User/Directory",
   *    contextName: "contextName",
   *    maxChunkSize: 400
   *  })
   * } catch (error) {
   *  console.error('Error uploading directory:', error);
   * }
   */
  async uploadDirectory(
    args: inputTypes.UploadDirectoryType,
  ): Promise<outputTypes.FlexibleType> {
    const files: inputTypes.FileType[] = [];

    for await (const file of this.fileGenerator(args.directory)) {
      files.push({ path: file.path });
    }

    if (files.length === 0) {
      throw new Error("No valid files found in the directory");
    }

    return await this.uploadFiles({
      files,
      contextName: args.contextName,
      maxChunkSize: args.maxChunkSize,
      metadataJson: args.metadataJson,
    });
  }

  /**
   * Uploads files to a context using presigned URLs.
   * @param args - The arguments for uploading files.
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   await ocClient.uploadFiles({
   *     files: [{path: "path/to/file1.pdf"}, {path: "path/to/file2.pdf"}],
   *     contextName: "contextName",
   *     contextId: "contextId",
   *     maxChunkSize: 600
   *   })
   * } catch (error) {
   *   console.error('Error uploading and processing files:', error);
   * }
   */
  async uploadFiles(
    args: inputTypes.UploadFilesType,
  ): Promise<outputTypes.FlexibleType> {
    // Step 1: Get presigned URLs for all files
    const fileNames = args.files.map((file) =>
      "path" in file ? path.basename(file.path) : "unnamed_file"
    );
    const presignedUrlsResponse: outputTypes.UploadParamsResponse[] =
      await this.request(
        "context/file/presigned-upload-url",
        {
          method: "POST",
          body: JSON.stringify({
            fileNames,
            contextName: args.contextName,
          }),
        },
      );

    const uploadPromises = args.files.map(async (file, index) => {
      const { presignedUrl, fileId, gcsUri } = presignedUrlsResponse[index];
      // only one metadataJson for all files in this upload batch
      // i.e. the type is a singular object, not an array of objects (for now)
      const metadataJson = args.metadataJson;
      let fileContent: Uint8Array | ReadableStream;
      let fileName: string;
      let fileType: string;

      fileName = basename(file.path);
      fileContent = await Deno.readFile(file.path);
      fileType = utils.getMimeType(file.path);

      try {
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: fileContent,
          headers: { "Content-Type": fileType },
        });

        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.text();
          throw new Error(
            `Upload failed with status ${uploadResponse.status}, body: ${errorBody}`,
          );
        } else {
          await uploadResponse.body?.cancel();
        }

        return {
          fileId,
          fileName,
          fileType,
          gcsUri,
          metadataJson,
        };
      } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
        return null;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter((
      result,
    ): result is NonNullable<typeof result> => result !== null);

    // Step 3: Send batch process request
    if (successfulUploads.length > 0) {
      return await this.request("context/file/process-uploaded", {
        method: "POST",
        body: JSON.stringify({
          files: successfulUploads,
          contextName: args.contextName,
          maxChunkSize: args.maxChunkSize,
        }),
      });
    } else {
      throw new Error("No files were successfully uploaded");
    }
  }

  /**
   * Sets an encrypted version of your OpenAI Key on your User Account on our servers.
   * Note, you do not have to do this if you do not want to, or, if you do not want to use OpenAI at all.
   *
   * In fact, if you do use OpenAI, you will get faster responses from our servers if you instantiate
   * your OneContext client with the OpenAI key instead of setting it with us. This way, you'll pass it to us
   * (in encrypted form) in the headers of each request you make. Reach out if this is unclear.
   *
   * @param args - The arguments for setting the OpenAI Key
   * @returns The response from the API.
   * @example
   * try {
   *   const ocClient = new OneContextClient(BASE_URL, API_KEY);
   *   await ocClient.setOpenAIApiKey({
   *     openAIApiKey: "your-openai-key"
   *   })
   * } catch (error) {
   *   console.error('Error setting key:', error);
   * }
   */
  async setOpenAIApiKey(
    args: inputTypes.SetOpenAIApiKeyType,
  ): Promise<outputTypes.FlexibleType> {
    return await this.request("user/updateUserMeta", {
      method: "POST",
      body: JSON.stringify(args),
    });
  }
}
