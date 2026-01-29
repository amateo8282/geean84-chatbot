import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export function ChatContainer({ messages, isLoading, error, onSend, onClear }) {
  const messagesEndRef = useRef(null);

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex flex-col h-full max-w-2xl mx-auto relative overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      {/* 배경 이미지 (Vintage Room) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/kian84_background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          filter: 'sepia(0.3) contrast(1.2)'
        }}
      />

      {/* Overlay to ensure text readability if needed */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-white/30"
      />
      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between p-4 mb-2">
        {/* Sketchy Header Background */}
        <div className="absolute inset-x-4 inset-y-2 -z-10 bg-white border-2 border-black transform -rotate-1 shadow-[4px_4px_0px_#333]"
          style={{ filter: 'url(#sketchy)' }} />

        <div className="pl-4">
          <h1
            className="text-5xl font-bold tracking-tight text-gray-900"
            style={{
              fontFamily: "'Nanum Pen Script', cursive",
              textShadow: '1px 1px 0px white, 2px 2px 0px rgba(0,0,0,0.1)'
            }}
          >
            인생84
          </h1>
          <p className="text-base text-gray-600 font-sans italic">기안84 페르소나 챗봇</p>
        </div>

        <div className="pr-4">
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClear}
              className="px-4 py-1.5 text-base bg-gray-100 border-2 border-black rounded shadow-[2px_2px_0px_black] hover:bg-white transition-all font-sans"
            >
              대화 초기화
            </motion.button>
          )}
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={onSend} />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={message.role === 'user'}
                />
              ))}
            </AnimatePresence>

            {/* 인사말만 있을 때 제안 버튼 표시 */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <SuggestionButtons onSuggestionClick={onSend} />
            )}
          </>
        )}

        {/* 에러 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-500 text-base font-sans py-2"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t-2 border-gray-300 bg-[#f5f5f0]">
        <ChatInput onSend={onSend} disabled={isLoading} />
      </div>
    </div>
  );
}

// 빈 상태 컴포넌트
function EmptyState({ onSuggestionClick }) {
  const suggestions = [
    '요즘 너무 힘들어요',
    '어떻게 하면 행복해질 수 있을까요?',
    '나이 들면서 외로워요',
    '뭘 해야 할지 모르겠어요',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center"
      >
        {/* 기안84 캐릭터 - 빈 상태일 때 보여줌 */}
        <div className="relative w-48 h-48 mb-6">
          <img
            src="/assets/kian84_character.png"
            alt="Kian84 Character"
            className="w-full h-full object-contain filter "
            style={{
              filter: 'drop-shadow(5px 5px 0px rgba(0,0,0,0.1))',
              mixBlendMode: 'multiply'
            }}
          />
        </div>

        <p
          className="text-5xl mb-2"
          style={{ fontFamily: "'Nanum Pen Script', cursive" }}
        >
          안녕하세요
        </p>
        <p
          className="text-3xl text-gray-600 mb-8"
          style={{ fontFamily: "'Nanum Pen Script', cursive" }}
        >
          뭐든 편하게 물어봐요
        </p>

        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {suggestions.map((text, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSuggestionClick(text)}
              className="px-4 py-2 text-base bg-white border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors"
              style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.2rem' }}
            >
              {text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// 제안 버튼 컴포넌트 (인사말 이후 표시용)
function SuggestionButtons({ onSuggestionClick }) {
  const suggestions = [
    '요즘 너무 힘들어요',
    '어떻게 하면 행복해질 수 있을까요?',
    '나이 들면서 외로워요',
    '뭘 해야 할지 모르겠어요',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-2 mt-6"
    >
      {suggestions.map((text, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSuggestionClick(text)}
          className="px-4 py-2 text-base bg-white border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors"
          style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.2rem' }}
        >
          {text}
        </motion.button>
      ))}
    </motion.div>
  );
}

export default ChatContainer;
