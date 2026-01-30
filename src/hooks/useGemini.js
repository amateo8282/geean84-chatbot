import { useState, useCallback } from 'react';
import { sendMessageStream, resetChat, initializeChat } from '../lib/openai';

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
const BASE_DELAY = 5000; // 5초

export function useGemini() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage, fileData = null) => {
    if ((!userMessage.trim() && !fileData) || isLoading) return;

    setError(null);

    // 사용자 메시지 추가
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      file: fileData ? { name: fileData.name, type: fileData.type } : null
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

    // Gemini API 파츠 구성
    const parts = [];
    if (userMessage.trim()) parts.push({ text: userMessage });
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.base64,
          mimeType: fileData.type
        }
      });
    }

    // 재시도 로직 포함 스트리밍 응답 처리
    let success = false;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 재시도 시 이전 내용 초기화
        if (attempt > 0) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId ? { ...msg, content: '' } : msg
            )
          );
        }

        for await (const chunk of sendMessageStream(parts)) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
        success = true;
        break;
      } catch (err) {
        console.error(`Gemini API 오류 (시도 ${attempt + 1}/${MAX_RETRIES + 1}):`, err);

        if (isRateLimitError(err) && attempt < MAX_RETRIES) {
          // 위트있는 재시도 메시지 표시
          const retryMsg = RETRY_MESSAGES[Math.floor(Math.random() * RETRY_MESSAGES.length)];
          const delay = BASE_DELAY * Math.pow(2, attempt); // 5s, 10s, 20s
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
          // 최종 실패 또는 다른 종류의 에러
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
    resetChat();
  }, []);

  // 기안84 스타일 인사말 목록 (위로의 말)
  const GREETINGS = [
    '뭐, 오늘도 하루가 시작됐네요. 힘들면 힘들다고 말해도 돼요. 다 그런 거니까.',
    '어, 왔어요? 뭐 별일 없죠? 없어도 괜찮고, 있어도 괜찮아요. 일단 얘기해봐요.',
    '안녕하세요. 뭐, 살다 보면 누군가한테 말하고 싶을 때가 있잖아요. 그냥 편하게요.',
    '오늘 좀 어때요? 괜찮아도 되고, 안 괜찮아도 돼요. 뭐 다 그런 거니까.',
    '어서 와요. 뭐, 대단한 건 못 해주지만 들어는 줄 수 있어요. 그것도 뭐 나쁘지 않잖아요?',
  ];

  const initialize = useCallback(() => {
    const success = initializeChat();
    if (success) {
      // 화면 로드 시 기안84가 먼저 인사
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: greeting,
      }]);
    }
    return success;
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
