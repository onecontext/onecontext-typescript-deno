# Official OneContext TypeScript Deno SDK

This is the official (Deno) TypeScript SDK for the OneContext platform. Use this SDK to connect your backend applications (with Deno),
and CLI tools, to OneContext's platform.

## What is OneContext?

OneContext is a platform that enables software engineers to compose and deploy custom RAG pipelines on SOTA
infrastructure, without all the faff.
You just create a context, and add files to it. You can then query your context using vector search, hybrid search, the
works, and OneContext takes care of all the infra behind the scenes (SSL certs, DNS, Kubernetes cluster, embedding
models, GPUs, autoscaling, load balancing, etc).

## Sounds great. How do I get started?

### Quickstart

#### Install the SDK

```bash
deno add @onecontext/sdk
```

#### API Key

Access to the OneContext platform is via an API key. If you already have one, great, pop it in an .env file in the root
of your project, or export it from the command line as an environment variable.

If you've misplaced your API key, you can rotate your existing one [here](https://app.onecontext.ai/settings).


#### Pop your API key in an .env file in the root of the repo (i.e. in the same directory as the package.json)

```zsh
touch .env
```

Add your API key to this .env file like so:

```dotenv
ONECONTEXT_API_KEY=your_api_key_here
```

## Play around

For the quickest set up, just clone [this](https://github.com/onecontext/onecontext-typescript-deno.git) repo and have a look at the `example-folder` for fully worked examples of how to do almost everything.

```zsh
git clone https://github.com/onecontext/onecontext-typescript-deno.git
```

Or, follow along below:

### Instantiate the client 

#### Make a helper script

```zsh
touch construct.ts
```

#### Pop the following in it

```ts
import {OneContextClient} from "./../mod.ts";
import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("ONECONTEXT_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const BASE_URL = Deno.env.get("BASE_URL");

// Check if required environment variables are set
if (!API_KEY || !OPENAI_API_KEY) {
  console.error(
    "Missing required environment variables. Please check your .env file.",
  );
  Deno.exit(1);
}

const ocClient = new OneContextClient({
  apiKey: API_KEY,
  openAiKey: OPENAI_API_KEY,
  baseUrl: BASE_URL || undefined,
});

export default ocClient;
```


### Create a Context

A `Context` is where you store your data. You can think of a `Context` as a "File Store", a "Knowledge Base", a "Second Brain", etc..

```ts
import ocClient from "./construct.ts";

try {
  const out = await ocClient.createContext({ contextName: "exampleContext" });
  console.log(out)
} catch (error) {
  console.error("Error creating context.", error);
}
```

### Throw a load of files at it

Now you can enrich your context with knowledge. You can make your context an expert in anything, just add files (PDF, DocX, .txt, .jpeg, etc.).

If you're on the free plan, you can have just one context, with up to 10 files (of less than 50 pages each). If you're
on the pro plan, you can have up to 5,000 contexts, each with up to 5,000 files.

#### You can add individual files

Just add file paths to the array. It's always better to upload multiple files in this way, rather than making multiple
requests with just one filepath in the array. We can process the jobs much faster (in a batch), and you're far less
likely to hit our rate limits.

```ts
import ocClient from "./construct.ts";

try {
  const out = await ocClient.uploadFiles({
    files: [{
      path:
        "/User/Folder/Example/example.pdf",
    }],
    contextName: "exampleContext",
    maxChunkSize: 400,
  });
  console.log(out)
} catch (error) {
  console.error("Error uploading files:", error);
}
```

#### You can also add full directories of files

```ts
import ocClient from "./construct.ts";

try {
  const out = await ocClient.uploadDirectory({
    directory: "/User/Folder/Example/",
    contextName: "exampleContext",
    maxChunkSize: 400,
  });
  console.log(out)
} catch (error) {
  console.error("Error fetching context list:", error);
}
```


#### List the files in a particular context

```ts
import ocClient from "./construct.ts";

try {
  await ocClient.listFiles({ contextName: "exampleContext" });
} catch (error) {
  console.error("Error fetching context list:", error);
}
```

#### List the contexts you have

```ts
import ocClient from "./construct.ts";

try {
  const out = await ocClient.contextList();
  console.log(out)
} catch (error) {
  console.error("Error fetching context list:", error);
}
```

#### Delete any contexts you no longer wish to have

```ts
import ocClient from "./construct.ts";

try {
  const out = await ocClient.deleteContext({ contextName: "exampleContext" });
  console.log(out)
} catch (error) {
  console.error("Error deleting context.");
}
```


#### Search through your context
Use this method to quickly search through your entire context (which can be thousands of files / hundreds of thousands
of pages).

More details on the arguments for this method:
- query: the query that will be embedded and used for the similarity search.
- contextName: the context you wish to execute the search over.
- topK: the number of "chunks" of context that will be retrieved.
- semanticWeight: how much to weight the relevance of the "semantic" similarity of the word. e.g. "Why, sometimes I've believed as many as six impossible things before breakfast." would be similar to "The man would routinely assume the veracity of ludicrous ideas in the morning", even though the words don't really have a lot in common.
- fullTextWeight: how much to weight the relevance of the similarity of the actual words in the context. e.g. "The King is at the palace, with the Queen", would be quite similar to "Knight takes Queen on e4", even though semantically these sentences have quite different meanings.
- rrfK:  a technical parameter which determines how we merge the scores for semantic, and fullText weights. For more see [here](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking)
- includeEmbedding: a Boolean value to be set to True or False depending on whether you want to do something with the embeddings for each chunk. If you want to do clustering or visualise the results in multidimensional space, choose True. If you just want fast context for your language model prompts, choose False.
- metadataFilters: An optional dictionary of criteria which can be used to filter results based on
  metadata. See the [OneContext Structured Query Language](#onecontext-structured-query-language) section below for the
  syntax details.
- structuredOutputRequest: an optional object you can pass if you want to co-erce the output of the Search into a defined schema. The object requires a `Schema` written in [Zod](https://zod.dev/), a `model` specification (either "gpt-4o" or "gpt-4o-mini"), and a `prompt` (a string which tells the model what to do).

```ts
import {ocClient} from "../construct.ts";
import { z } from "npm:zod@3.23.8";

try {

  const candidate = z.object({
    title: z.string().describe('the title of the sea shanty'),
    lyrics: z.string().describe('lyrics to their absolute banger of a shanty'),
  }).describe('a schema for a sea shanty');

  const model  = "gpt-4o-mini";

  const output = await ocClient.contextSearch(
          {
            "query": "return chunks relating to rockbands",
            "contextName": "counsel",
            "metadataFilters": {
              $and: [{ year: { $eq: 1970 } }, { label: { $contains: "columbia" } }],
            },
            "topK": 20,
            "semanticWeight": 0.3,
            "fullTextWeight": 0.7,
            "rrfK": 50,
            "includeEmbedding": false,
            "structuredOutputRequest": {structuredOutputSchema: candidate, model: model, prompt: "Produce this sea shanty"},
          },
  );

  // console.log("Chunks: ", output.chunks)
  console.log("Output: ", output.output)

} catch (error) {
  console.error("Error searching context.", error);
}
```
#### Retrieve chunks from your context (without semantic searching)
Use this method to quickly retrieve chunks from your context which correspond to a set of filters.

More details on the arguments for this method:
- contextName: the context you wish to execute the search over.
- limit: the number of "chunks" of context that will be retrieved.
- includeEmbedding: a Boolean value to be set to True or False depending on whether you want to do something with the embeddings for each chunk. If you want to do clustering or visualise the results in multidimensional space, choose True. If you just want fast context for your language model prompts, choose False.
- metadataFilters: A dictionary of criteria used to filter results based on
  metadata. See the [OneContext Structured Query Language](#onecontext-structured-query-language) section below for the
  syntax details.
- structuredOutputRequest: an optional object you can pass if you want to co-erce the output of the Search into a defined schema. The object requires a `Schema` written in [Zod](https://zod.dev/), a `model` specification (either "gpt-4o" or "gpt-4o-mini"), and a `prompt` (a string which tells the model what to do).

```ts
import ocClient from './construct.js';

try {
  const out = await ocClient.contextGet(
    {
      "contextName": "lots",
      "metadataFilters": {
        $and: [{ age: { $gt: 10 } }, { name: { $contains: "ross" } }],
      },
      "limit": 5,
      "includeEmbedding": false,
    },
  );
  console.log(out)
} catch (error) {
  console.error("Error searching context.", error);
}

```

# OneContext Structured Query Language

OneContext allows you to use a custom "Structured Query Language" to filter
the chunks in your context.

The syntax is quite similar to what you might find in no-SQL databases like
MongoDB, even though it operates on a SQL database at its core.

The syntax is based around the application of `operators`. There are _two_
levels of operators. You can interpret the two levels as "aggregators" and
"comparators".

### Aggregators

The aggregator operators you can use are:

| Key    | Value Description                                                      |
|--------|------------------------------------------------------------------------|
| `$and` | Returns True i.f.f. _all_ of the conditions in this block return True. |
| `$or`  | Returns True if _any_ of the conditions in this block return True.     |

### Comparators

The comparator operators you can use are:

| Key         | Value Description                                                                  | Value Type                     | 
|-------------|------------------------------------------------------------------------------------|--------------------------------|
| `$eq`       | Returns True if the value returned from the DB is equal to the supplied value.     | `string,int,float,bool`        | 
| `$gt`       | Returns True if the value returned from the DB is greater than the supplied value. | `int,float,bool`               |
| `$lt`       | Returns True if the value returned from the DB is less than the supplied value.    | `int,float,bool`               |
| `$in`       | Returns True if the value returned from the DB is contained by the supplied array. | `array<string,int,float,bool>` |
| `$contains` | Returns True if the array value returned from the DB contains the supplied value.  | `string,int,float,bool`        |
| `$neq`      | Returns True if the value returned from the DB is not equal to the supplied value. | `string,int,float,bool`        |


## License

`@onecontext/sdk` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.