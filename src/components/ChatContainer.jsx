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
      className="flex flex-col h-full max-w-2xl mx-auto"
      style={{ minHeight: '100dvh' }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 border-b-2 border-gray-300">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Nanum Pen Script', cursive" }}
          >
            인생84
          </h1>
          <p className="text-sm text-gray-500 font-sans">기안84와 대화하기</p>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="px-3 py-1.5 text-sm text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-sans"
          >
            대화 초기화
          </motion.button>
        )}
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={onSend} />
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
          </AnimatePresence>
        )}

        {/* 에러 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-500 text-sm font-sans py-2"
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
        className="text-center"
      >
        <p
          className="text-4xl mb-2"
          style={{ fontFamily: "'Nanum Pen Script', cursive" }}
        >
          안녕하세요
        </p>
        <p
          className="text-2xl text-gray-600 mb-8"
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
              className="px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors"
              style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem' }}
            >
              {text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default ChatContainer;
