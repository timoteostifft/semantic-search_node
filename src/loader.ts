import path from 'node:path'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { createClient } from 'redis'

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
    chunkSize: 1,
    chunkOverlap: 0
  })

  const splittedDocumments = await splitter.splitDocuments(docs)

  console.log(splittedDocumments)
}

load();