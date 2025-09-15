import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import fs from "fs/promises";
import path from "path";

//how to save a pdf file for context embedding??? 
//2. Handle the text content from the front end
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const text = formData.get("text");
    const file = formData.get("file");

    let docs = [];

    if (text) {
      docs.push({ pageContent: text });
    }

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const tempDir = path.join(process.cwd(), "temp");
      await fs.mkdir(tempDir, { recursive: true });

      const filePath = path.join(tempDir, file.name);
      await fs.writeFile(filePath, buffer);

      if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
          const loader = new PDFLoader(filePath);
          const pdfDocs = await loader.load();
          docs.push(...pdfDocs);
        } catch (pdfErr) {
          console.error("PDF parsing error:", pdfErr);
          return NextResponse.json({ error: "Failed to parse PDF" }, { status: 400 });
        }
      }

      await fs.unlink(filePath);
    }

    if (docs.length > 0) {
      const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
      await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: "http://localhost:6333",
        collectionName: "llmnotebook-collection",
      });
    }

    return NextResponse.json({ message: "Indexing done" });

  } catch (err) {
    console.error("Error indexing:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
