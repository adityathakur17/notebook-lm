import {
  VectorStore,
  VectorStoreRetriever,
} from "@langchain/core/vectorstores";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const client = new OpenAI();

    const userQuery = await request.json();

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "llmnotebook-collection",
      }
    );

    const vectorRetriever = vectorStore.asRetriever({
      k: 3,
    });

    const relevantChunk = await vectorRetriever.invoke(userQuery);

    const SYSTEM_PROMPT = `
    You are an AI assistant who helps resolving user query based on the
    context available to you from a PDF file with the content and page number.

    Only ans based on the available context from file only.

    Context:
    ${JSON.stringify(relevantChunk)}
  `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    return Response.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to process request",
      },
      {
        status: 500,
      }
    );
  }
}
