import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

export async function POST(req) {
  console.log("inside function");
  try {
    const client = new OpenAI();

    const { message } = await req.json();

    const REFINED_PROMPT = `
    You are a query rewriting agent. Rewrite user queries so they are clear, concise, and easy for AI agents to understand.
    You fix typos and add extra context whenever required for better retrieval of information

    Examples:
    - "How High is the Eiffel Tower, it looked so huge when I was there last spring"
      → "What is the height of the Eiffel Tower?"

    - "1 oz is 28 grams, how many cm is 1 inch"
      → "Convert 1 inch to cm"

    - "What is the main point of this article? What did the author try to convey?"
      → "What is the main key point of this article?"

    - "What is nodesj?"
      → "What is node.js?"
    `;

    const query = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REFINED_PROMPT },
        { role: "user", content: message },
      ],
    });

    const refinedQuery = query.choices[0].message.content;
    console.log(refinedQuery, "refined query");

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
    console.log("vector store connected", vectorStore);

    const hydePrompt = `
    Generate a hypothetical answer for the asked question.
    Don't say 'I dont know' -  give the best answer possible.

    Question: ${refinedQuery}
    `;

    const hydeRes = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: hydePrompt }],
    });
    console.log(hydeRes, "HydeRes");

    const hydeResult = hydeRes.choices[0].message.content;
    console.log(hydeResult);

    const hydeEmbeddings = await embeddings.embedQuery(hydeResult);

    const relevantDocs = await vectorStore.similaritySearchVectorWithScore(
      hydeEmbeddings,
      4
    );

    console.log(relevantDocs, "RELEVANT DOCSSSS");

    // const vectorRetriever = vectorStore.asRetriever({
    //   k: 3,
    // });

    // const relevantChunk = await vectorRetriever.invoke(refinedQuery);

    //STEP 2 Retrieving Info from the database

    const context = relevantDocs
      .map(([doc, score]) => doc.pageContent)
      .filter(Boolean) // remove empty/null docs
      .join("\n\n---\n\n");
    console.log(context, "contextssssss");
    const SYSTEM_PROMPT = `
    You are an AI assistant who helps resolving user query based on the
    context available to you with the content and page number(if applicable).

    Only answer based on the available context only.

    Context:
    ${context}
  `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: refinedQuery },
      ],
    });

    return NextResponse.json({
      response: response.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      {
        status: 500,
      }
    );
  }
}
