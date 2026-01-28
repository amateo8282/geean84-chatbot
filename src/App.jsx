import { useEffect } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { FloatingImages } from './components/FloatingImage';
import { useGemini } from './hooks/useGemini';

function App() {
  const { messages, isLoading, error, sendMessage, clearMessages, initialize } = useGemini();

  useEffect(() => {
    const success = initialize();
    if (!success) {
      console.warn('Gemini API가 초기화되지 않았습니다. .env 파일에 API 키를 설정하세요.');
    }
  }, [initialize]);

  // 제안 버튼 클릭 핸들러를 위해 ChatContainer에 전달
  const handleSend = (message) => {
    sendMessage(message);
  };

  return (
    <div className="relative min-h-screen bg-[#f5f5f0]">
      {/* 배경 플로팅 이미지 */}
      <FloatingImages />

      {/* 메인 채팅 컨테이너 */}
      <div className="relative z-10">
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSend={handleSend}
          onClear={clearMessages}
        />
      </div>
    </div>
  );
}

export default App;
