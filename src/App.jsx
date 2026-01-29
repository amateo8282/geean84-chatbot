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

      {/* 우기명 & 봉지은 고정 캐릭터 (데스크탑 전용) */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden xl:block">
        {/* 우기명 (좌측) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute left-[5%] bottom-[15%] w-64"
        >
          <img src="/assets/gimyeong.png" alt="우기명" className="w-full h-auto filter grayscale-[30%] sepia-[0.2]" />
          <div className="absolute -top-10 left-10 bg-white border-2 border-black px-3 py-1 text-xl transform -rotate-6 shadow-[2px_2px_0px_black]" style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
            집중하자 집중!!!
          </div>
        </motion.div>

        {/* 봉지은 (우측) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute right-[5%] bottom-[15%] w-72"
        >
          <img src="/assets/jieun.png" alt="봉지은" className="w-full h-auto filter grayscale-[30%] sepia-[0.2]" />
          <div className="absolute -top-10 right-10 bg-white border-2 border-black px-3 py-1 text-xl transform rotate-6 shadow-[2px_2px_0px_black]" style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
            갈게 오빠.
          </div>
        </motion.div>
      </div>

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
