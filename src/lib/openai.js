import { systemPrompt } from './systemPrompt';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

let conversationHistory = [];
let initialized = false;

export function initializeChat() {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
    return false;
  }

  conversationHistory = [];
  initialized = true;
  return true;
}

function buildMessages(parts) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
  ];

  // Build user message content
  const content = [];

  for (const part of parts) {
    if (part.text) {
      content.push({ type: 'text', text: part.text });
    }
    if (part.inlineData) {
      // Image support via vision API
      const { data, mimeType } = part.inlineData;
      if (mimeType.startsWith('image/')) {
        content.push({
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${data}` },
        });
      } else {
        // For non-image files, add as text description
        try {
          const text = atob(data);
          content.push({ type: 'text', text: `[첨부파일 내용]\n${text}` });
        } catch {
          content.push({ type: 'text', text: '[첨부파일: 읽을 수 없는 형식]' });
        }
      }
    }
  }

  messages.push({ role: 'user', content });
  return messages;
}

export async function* sendMessageStream(parts) {
  if (!initialized) {
    const success = initializeChat();
    if (!success) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
  }

  const finalParts = typeof parts === 'string' ? [{ text: parts }] : parts;
  const messages = buildMessages(finalParts);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 500,
      stream: true,
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
        const content = parsed.choices?.[0]?.delta?.content;
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
  // Extract user text for history
  const userText = finalParts
    .filter(p => p.text)
    .map(p => p.text)
    .join(' ');
  if (userText) {
    conversationHistory.push({ role: 'user', content: userText });
  }
  if (fullResponse) {
    conversationHistory.push({ role: 'assistant', content: fullResponse });
  }
}

export function resetChat() {
  conversationHistory = [];
}
