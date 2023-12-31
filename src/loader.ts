import 'dotenv/config'
import path from 'node:path'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { createClient } from 'redis'
import { RedisVectorStore } from 'langchain/vectorstores/redis'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'


const loader = new DirectoryLoader(
  path.resolve(__dirname, '../tmp'),
  {
    '.json': path => new JSONLoader(path, '/text')
  }
)

async function load() {
  const docs = await loader.load()

  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: 10,
    chunkOverlap: 0
  })

  const splittedDocumments = await splitter.splitDocuments(docs)

  const redis = createClient({
    url: 'redis://127.0.0.1:6379'
  })

  await redis.connect()

  await RedisVectorStore.fromDocuments(
    splittedDocumments,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      indexName: 'questions-embeddings',
      redisClient: redis,
      keyPrefix: 'questions:'
    }  
  )

  await redis.disconnect()
}

load();