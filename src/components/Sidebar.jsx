import { motion } from 'framer-motion';
import { ConversationList } from './ConversationList';
import { ChatbotList } from './ChatbotList';

export function Sidebar({
  conversations, activeConversationId,
  onSelectConversation, onDeleteConversation, onNewConversation,
  chatbots, activeChatbot, onSelectChatbot, onCreateChatbot,
  onClose,
}) {
  return (
    <div className="h-full flex flex-col bg-[#f5f5f0] border-r-2 border-gray-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-300">
        <h2 className="text-2xl font-bold"
          style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
          인생84
        </h2>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="사이드바 닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* 새 대화 버튼 */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewConversation}
          className="w-full py-2 px-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          style={{
            fontFamily: "'Nanum Pen Script', cursive",
            fontSize: '1.1rem',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          }}
        >
          + 새 대화
        </motion.button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2 px-1">대화 목록</p>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={onSelectConversation}
            onDelete={onDeleteConversation}
          />
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2 px-1">챗봇</p>
          <ChatbotList
            chatbots={chatbots}
            activeChatbot={activeChatbot}
            onSelect={onSelectChatbot}
            onCreateNew={onCreateChatbot}
          />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
