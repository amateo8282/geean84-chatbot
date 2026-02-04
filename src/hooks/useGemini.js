import { useState, useCallback, useRef } from 'react';
import { sendMessageStream, resetChat, initializeChat, setSystemPrompt, loadHistory } from '../lib/openai';
import { systemPrompt as defaultSystemPrompt } from '../lib/systemPrompt';
import { DEFAULT_PRESET } from '../lib/presetChatbots';

// 재시도 대기 중 보여줄 위트있는 메시지들 (기안84 스타일)
const RETRY_MESSAGES = [
  '아... 서버가 좀 바쁜가 봐요. 뭐, 인생도 기다림의 연속이니까.',
  '잠깐만요, 서버가 쉬고 싶대요. 뭐 다들 쉬고 싶지...',
  '서버도 사람이에요... 아 사람은 아니지만. 일단 좀 기다려봅시다.',
  '너무 많이 물어봤나 봐요. 근데 궁금한 게 많은 건 좋은 거 아니겠어요?',
  '서버가 "나 좀 쉬자"래요. 솔직하게 말이에요, 저도 가끔 그러고 싶거든요.',
];

function isRateLimitError(err) {
  const msg = err?.message || '';
  return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
}

const MAX_RETRIES = 3;
const BASE_DELAY = 5000;

export function useGemini() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenUsage, setTokenUsage] = useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });

  // Callbacks for external integrations (Supabase save, RAG context)
  const onMessageCompleteRef = useRef(null);
  const ragContextBuilderRef = useRef(null);

  const sendMessage = useCallback(async (userMessage, fileData = null) => {
    if ((!userMessage.trim() && !fileData) || isLoading) return;

    setError(null);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      file: fileData ? { name: fileData.name, type: fileData.type } : null,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const aiMsgId = Date.now() + 1;
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, aiMsg]);

    // Build RAG context if available
    let actualMessage = userMessage;
    if (ragContextBuilderRef.current && userMessage.trim()) {
      try {
        const context = await ragContextBuilderRef.current(userMessage);
        if (context) {
          actualMessage = context;
        }
      } catch (err) {
        console.error('RAG 컨텍스트 구성 실패:', err);
      }
    }

    // Gemini API 파츠 구성
    const parts = [];
    if (actualMessage.trim()) parts.push({ text: actualMessage });
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.base64,
          mimeType: fileData.type,
        },
      });
    }

    // 재시도 로직 포함 스트리밍 응답 처리
    let fullContent = '';
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          fullContent = '';
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId ? { ...msg, content: '' } : msg
            )
          );
        }

        for await (const chunk of sendMessageStream(parts)) {
          if (chunk.text) {
            fullContent += chunk.text;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMsgId
                  ? { ...msg, content: msg.content + chunk.text }
                  : msg
              )
            );
          }

          if (chunk.usageMetadata) {
            const meta = chunk.usageMetadata;
            const msgTokens = {
              promptTokens: meta.promptTokenCount || 0,
              completionTokens: meta.candidatesTokenCount || 0,
              totalTokens: meta.totalTokenCount || 0,
            };

            setTokenUsage(prev => ({
              promptTokens: prev.promptTokens + msgTokens.promptTokens,
              completionTokens: prev.completionTokens + msgTokens.completionTokens,
              totalTokens: prev.totalTokens + msgTokens.totalTokens,
            }));

            // Notify external handler (e.g., save to Supabase)
            if (onMessageCompleteRef.current) {
              onMessageCompleteRef.current({
                userMessage: userMsg,
                aiMessage: { ...aiMsg, content: fullContent },
                tokenUsage: msgTokens,
              });
            }
          }
        }
        break; // success
      } catch (err) {
        console.error(`Gemini API 오류 (시도 ${attempt + 1}/${MAX_RETRIES + 1}):`, err);

        if (isRateLimitError(err) && attempt < MAX_RETRIES) {
          const retryMsg = RETRY_MESSAGES[Math.floor(Math.random() * RETRY_MESSAGES.length)];
          const delay = BASE_DELAY * Math.pow(2, attempt);
          const delaySec = Math.round(delay / 1000);

          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content: `${retryMsg}\n\n(${delaySec}초 후 다시 시도할게요... ${attempt + 1}/${MAX_RETRIES})` }
                : msg
            )
          );

          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          if (isRateLimitError(err)) {
            setError('뭐, 오늘은 서버가 좀 많이 지쳤나 봐요. 나중에 다시 와주세요.');
          } else {
            setError(err.message || '응답을 받는 중 오류가 발생했습니다.');
          }
          setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
          break;
        }
      }
    }

    setIsLoading(false);
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setTokenUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    resetChat();
  }, []);

  const initialize = useCallback(() => {
    const success = initializeChat();
    if (success) {
      const greetings = DEFAULT_PRESET.greetings;
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: greeting,
      }]);
    }
    return success;
  }, []);

  // Load existing conversation messages and rebuild chat history
  const loadConversation = useCallback((existingMessages, customSystemPrompt) => {
    setSystemPrompt(customSystemPrompt || defaultSystemPrompt);

    const history = existingMessages
      .filter(msg => msg.content)
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    loadHistory(history);
    setMessages(existingMessages);
    setTokenUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    setError(null);
  }, []);

  // Start a new conversation with optional custom system prompt and greetings
  const startNewConversation = useCallback((customSystemPrompt, greetings) => {
    setSystemPrompt(customSystemPrompt || defaultSystemPrompt);
    resetChat();
    setTokenUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    setError(null);

    // Show greeting
    const greetingList = greetings || DEFAULT_PRESET.greetings;
    const greeting = greetingList[Math.floor(Math.random() * greetingList.length)];
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: greeting,
    }]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    tokenUsage,
    sendMessage,
    clearMessages,
    initialize,
    loadConversation,
    startNewConversation,
    onMessageCompleteRef,
    ragContextBuilderRef,
  };
}

export default useGemini;
