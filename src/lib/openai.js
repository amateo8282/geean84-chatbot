import { systemPrompt } from './systemPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

let conversationHistory = [];
let initialized = false;

export function initializeChat() {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('Gemini API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return false;
  }

  conversationHistory = [];
  initialized = true;
  return true;
}

function buildContents(parts) {
  const contents = [
    ...conversationHistory,
  ];

  // Build user message parts in Gemini format
  const geminiParts = [];

  for (const part of parts) {
    if (part.text) {
      geminiParts.push({ text: part.text });
    }
    if (part.inlineData) {
      geminiParts.push({
        inlineData: {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data,
        },
      });
    }
  }

  contents.push({ role: 'user', parts: geminiParts });
  return contents;
}

export async function* sendMessageStream(parts) {
  if (!initialized) {
    const success = initializeChat();
    if (!success) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
  }

  const finalParts = typeof parts === 'string' ? [{ text: parts }] : parts;
  const contents = buildContents(finalParts);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;
    const errorMessage = errorData?.error?.message || response.statusText;
    throw new Error(`${status} ${errorMessage}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          fullResponse += content;
          yield content;
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  // Save to conversation history
  const userText = finalParts
    .filter(p => p.text)
    .map(p => p.text)
    .join(' ');
  if (userText) {
    conversationHistory.push({ role: 'user', parts: [{ text: userText }] });
  }
  if (fullResponse) {
    conversationHistory.push({ role: 'model', parts: [{ text: fullResponse }] });
  }
}

export function resetChat() {
  conversationHistory = [];
}
