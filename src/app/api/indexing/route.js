import { VectorStore } from "@langchain/core/vectorstores";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function init(){
    const pdfFilePath = '';
    const loader = new PDFLoader(pdfFilePath)

    //Page by page load the pdf file
    const docs = await loader.load()

    const embeddings  = new OpenAIEmbeddings({
        model: 'text-embedding-3-small'
    })

    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings,{
        url: 'http://localhost:6333',
        collectionName: 'llmnotebook-collection'
    })

    console.log('Indexing of documents done')
}