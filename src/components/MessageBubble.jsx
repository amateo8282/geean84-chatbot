import { motion } from 'framer-motion';
import { BubbleBorder } from './DrawnBorder';

export function MessageBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <BubbleBorder isUser={isUser} className="max-w-[80%] md:max-w-[70%]">
        <div className="px-4 py-3">
          {!isUser && (
            <div className="text-xs text-gray-500 mb-1 font-sans">기안84</div>
          )}
          <p
            className="text-lg leading-relaxed whitespace-pre-wrap break-words"
            style={{
              fontFamily: "'Nanum Pen Script', cursive",
              fontSize: '1.25rem',
              lineHeight: '1.8',
            }}
          >
            {message.content}
            {/* 타이핑 커서 효과 (로딩 중일 때) */}
            {!isUser && message.content === '' && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-gray-400 ml-1"
              />
            )}
          </p>
        </div>
      </BubbleBorder>
    </div>
  );
}

// 로딩 표시
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <BubbleBorder isUser={false} className="px-4 py-3">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </BubbleBorder>
    </div>
  );
}

export default MessageBubble;
