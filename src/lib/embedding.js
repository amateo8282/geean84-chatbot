import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai = null;

function getAI() {
  if (!ai && API_KEY && API_KEY !== 'your_api_key_here') {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export async function generateEmbedding(text) {
  const client = getAI();
  if (!client) {
    console.error('Gemini API가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const response = await client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: { outputDimensionality: 768 },
    });

    return response.embeddings?.[0]?.values || null;
  } catch (err) {
    console.error('임베딩 생성 실패:', err);
    return null;
  }
}

export async function generateEmbeddings(texts) {
  const client = getAI();
  if (!client) {
    console.error('Gemini API가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const response = await client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts,
      config: { outputDimensionality: 768 },
    });

    return (response.embeddings || []).map((e) => e.values);
  } catch (err) {
    console.error('배치 임베딩 생성 실패:', err);
    return [];
  }
}
