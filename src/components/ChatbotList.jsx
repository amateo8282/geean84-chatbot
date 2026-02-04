import { motion } from 'framer-motion';

const DEFAULT_CHATBOT = {
  id: null,
  name: '기안84',
  description: '웹툰 작가이자 방송인',
  avatar_emoji: '✏️',
};

export function ChatbotList({ chatbots, activeChatbot, onSelect, onCreateNew }) {
  const allChatbots = [DEFAULT_CHATBOT, ...chatbots];

  return (
    <div className="space-y-1">
      {allChatbots.map(bot => {
        const isActive =
          (bot.id === null && activeChatbot === null) ||
          bot.id === activeChatbot?.id;

        return (
          <motion.div
            key={bot.id || 'default'}
            whileHover={{ x: 2 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#e8e4d9] border-2 border-gray-300'
                : 'hover:bg-[#eae7de] border-2 border-transparent'
            }`}
            onClick={() => onSelect(bot.id === null ? null : bot)}
          >
            <span className="text-lg">{bot.avatar_emoji}</span>
            <span className="text-sm truncate"
              style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem' }}>
              {bot.name}
            </span>
          </motion.div>
        );
      })}

      {onCreateNew && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-[#eae7de] transition-colors border-2 border-dashed border-gray-300"
        >
          <span className="text-lg">+</span>
          <span style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem' }}>
            만들기
          </span>
        </motion.button>
      )}
    </div>
  );
}

export default ChatbotList;
