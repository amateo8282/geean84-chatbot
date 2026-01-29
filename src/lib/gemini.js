import { GoogleGenerativeAI } from '@google/generative-ai';
import { systemPrompt } from './systemPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;
let chat = null;

export function initializeGemini() {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('Gemini API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return false;
  }

  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: systemPrompt,
  });

  chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 500,
    },
  });

  return true;
}

export async function sendMessage(message) {
  if (!chat) {
    const initialized = initializeGemini();
    if (!initialized) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
  }

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

export async function* sendMessageStream(parts) {
  if (!chat) {
    const initialized = initializeGemini();
    if (!initialized) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
  }

  // If parts is a string, convert to single part array
  const finalParts = typeof parts === 'string' ? [parts] : parts;

  const result = await chat.sendMessageStream(finalParts);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

export function resetChat() {
  if (model) {
    chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      },
    });
  }
}
