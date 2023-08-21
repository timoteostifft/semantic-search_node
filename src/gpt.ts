import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { RetrievalQAChain } from 'langchain/chains'
import { redis, redisVectorStore } from './redis-store'

const openAiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3
})

const prompt = new PromptTemplate({
  template: `
   Você precisa conferir se o significado da frase recebida já existem no banco de frases abaixo.
   A frase não precisa ser idêntica, apenas ter o mesmo siginficado.
   Por exemplo: "Como criar um cadastro?", "Como faço para me cadastrar?" e "Como que faz para criar uma conta?"
   tem o mesmo significado.
   Também considere erros de escrita leves, como falta de acentuação e letras faltando.
   Caso já esteja, retorne o registro que se assemelha.
   Caso não esteja, diga que isso não é uma opção.

   Banco de frases:
   {context}

   Mensagem recebida:
   {question}
  `.trim(),
  inputVariables: ['context', 'question']
})

const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(3), {
  prompt,
  returnSourceDocuments: true,
  // verbose: true 
})

async function main() {
  await redis.connect()

  const response = await chain.call({
    query: 'Quero criar uma conta nova.'
  })

  console.log(response)

  await redis.disconnect()
}

main()