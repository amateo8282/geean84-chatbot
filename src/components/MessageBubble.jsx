import { motion } from 'framer-motion';
import { BubbleBorder } from './DrawnBorder';

export function MessageBubble({ message, isUser }) {
  // Simple random check to show sound effect (30% chance)
  const showSfx = !isUser && Math.random() > 0.7;
  const sfxList = ['두둥', '슥..', '터벅', '탁', '...'];
  const randomSfx = sfxList[Math.floor(Math.random() * sfxList.length)];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative`}>
      {/* Sound Effect Decoration */}
      {showSfx && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
          className="absolute -top-6 -left-6 z-20 text-2xl font-bold bg-white/80 p-1 rounded transform -rotate-12 pointer-events-none border border-black"
          style={{
            fontFamily: "'Nanum Pen Script', cursive",
            color: '#000',
            textShadow: '2px 2px 0px #fff'
          }}
        >
          {randomSfx}
        </motion.div>
      )}

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
            {/* 파일 첨부 표시 */}
            {isUser && message.file && (
              <div className="mb-2 p-2 bg-gray-100 border-2 border-dashed border-black rounded flex items-center gap-2 text-sm font-sans">
                <span className="bg-black text-white px-2 py-0.5 rounded text-xs">FILE</span>
                <span className="truncate max-w-[200px]">{message.file.name}</span>
              </div>
            )}

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
