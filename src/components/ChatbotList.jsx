import { motion } from 'framer-motion';
import { PRESET_CHATBOTS } from '../lib/presetChatbots';

export function ChatbotList({ chatbots, activeChatbot, onSelect, onCreateNew }) {
  return (
    <div className="space-y-1">
      {/* 프리셋 챗봇 */}
      {PRESET_CHATBOTS.map(bot => {
        const isActive = bot.id === activeChatbot?.id;

        return (
          <motion.div
            key={bot.id}
            whileHover={{ x: 2 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#e8e4d9] border-2 border-gray-300'
                : 'hover:bg-[#eae7de] border-2 border-transparent'
            }`}
            onClick={() => onSelect(bot)}
          >
            <span className="text-lg">{bot.avatar_emoji}</span>
            <span className="text-sm truncate"
              style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem' }}>
              {bot.name}
            </span>
          </motion.div>
        );
      })}

      {/* 구분선 */}
      {chatbots.length > 0 && (
        <div className="my-2 border-t border-gray-300" />
      )}

      {/* 커스텀 챗봇 */}
      {chatbots.map(bot => {
        const isActive = bot.id === activeChatbot?.id;

        return (
          <motion.div
            key={bot.id}
            whileHover={{ x: 2 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#e8e4d9] border-2 border-gray-300'
                : 'hover:bg-[#eae7de] border-2 border-transparent'
            }`}
            onClick={() => onSelect(bot)}
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
