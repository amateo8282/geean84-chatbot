import { useState, useCallback } from 'react';
import { sendMessageStream, resetChat, initializeGemini } from '../lib/gemini';

export function useGemini() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;

    setError(null);

    // 사용자 메시지 추가
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // AI 응답 메시지 준비
    const aiMsgId = Date.now() + 1;
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, aiMsg]);

    try {
      // 스트리밍 응답 처리
      for await (const chunk of sendMessageStream(userMessage)) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Gemini API 오류:', err);
      setError(err.message || '응답을 받는 중 오류가 발생했습니다.');

      // 에러 시 빈 AI 메시지 제거
      setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    resetChat();
  }, []);

  const initialize = useCallback(() => {
    return initializeGemini();
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    initialize,
  };
}

export default useGemini;
