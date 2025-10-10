import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as cheerio from cheerio;

export async function POST(req){
    try{
        const {url} = req.json()

        if(!url) {
            return NextResponse.json({error:'Missing URL'}, {status:400})
        }

        const res = await fetch(url)
        const html = await res.text()

        const $ = cheerio.load(html);
        const text = $("body").text().replace(/\s+/g, " ").trim();

        if(!text || text.length<200){
            return NextResponse.json({error:'Website has insufficient data'},{status:400})
        }

        const embeddings = new OpenAIEmbeddings({
            model:"text-embedding-3-small"
        })

        await QdrantVectorStore.fromTexts([text],[{source:url}], embeddings,{
            url:"http://localhost:6333",
            collectionName:"llmnotebook-collection"
        })

        return NextResponse.json({
            message:"Website content added successfully to notebook"
        })
    }catch(error){
        console.error("Error processing request",error);
        return NextResponse.json({error:'Failed to fetch or process request'},{status:500})
    }
}