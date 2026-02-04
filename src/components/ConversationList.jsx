import { motion } from 'framer-motion';

export function ConversationList({ conversations, activeConversationId, onSelect, onDelete }) {
  if (conversations.length === 0) {
    return (
      <p className="text-sm text-gray-400 px-3 py-2"
        style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
        아직 대화가 없어요
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map(conv => (
        <motion.div
          key={conv.id}
          whileHover={{ x: 2 }}
          className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            conv.id === activeConversationId
              ? 'bg-[#e8e4d9] border-2 border-gray-300'
              : 'hover:bg-[#eae7de] border-2 border-transparent'
          }`}
          onClick={() => onSelect(conv.id)}
        >
          <span className="text-sm truncate flex-1 mr-2"
            style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1rem' }}>
            {conv.title || '새 대화'}
          </span>
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs p-1"
              aria-label="대화 삭제"
            >
              ✕
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default ConversationList;
