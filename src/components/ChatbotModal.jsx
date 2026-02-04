import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KnowledgeDocForm } from './KnowledgeDocForm';

const EMOJI_OPTIONS = ['🤖', '📚', '🧠', '💡', '🎨', '🔬', '📝', '🎵', '🌍', '💬'];

export function ChatbotModal({ isOpen, onClose, onSave, chatbot }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🤖');
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chatbot) {
      setName(chatbot.name || '');
      setDescription(chatbot.description || '');
      setSystemPrompt(chatbot.system_prompt || '');
      setAvatarEmoji(chatbot.avatar_emoji || '🤖');
    } else {
      setName('');
      setDescription('');
      setSystemPrompt('');
      setAvatarEmoji('🤖');
    }
    setKnowledgeDocs([]);
  }, [chatbot, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        system_prompt: systemPrompt.trim(),
        avatar_emoji: avatarEmoji,
        knowledgeDocs,
      });
    } catch (err) {
      console.error('챗봇 저장 실패:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[85vh] bg-[#f5f5f0] border-2 border-gray-300 rounded-xl z-50 flex flex-col overflow-hidden"
            style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-300">
              <h3 className="text-2xl font-bold"
                style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
                {chatbot ? '챗봇 수정' : '새 챗봇 만들기'}
              </h3>
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-sans block mb-1">아이콘</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setAvatarEmoji(emoji)}
                      className={`text-2xl p-1.5 rounded-lg border-2 transition-colors ${
                        avatarEmoji === emoji ? 'border-gray-400 bg-[#e8e4d9]' : 'border-transparent hover:bg-gray-100'
                      }`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-sans block mb-1">이름 *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="챗봇 이름"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-400"
                  style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '1.1rem' }} />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-sans block mb-1">설명</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="챗봇에 대한 짧은 설명"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-sans focus:outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-sans block mb-1">시스템 프롬프트 *</label>
                <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                  placeholder="챗봇의 성격, 말투, 역할을 정의하세요..." rows={5}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-sans resize-none focus:outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-sans block mb-1">배경지식 (RAG)</label>
                <KnowledgeDocForm
                  documents={knowledgeDocs}
                  onAdd={doc => setKnowledgeDocs(prev => [...prev, doc])}
                  onRemove={i => setKnowledgeDocs(prev => prev.filter((_, idx) => idx !== i))}
                />
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t-2 border-gray-300 flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-2 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-sans text-sm">
                취소
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!name.trim() || !systemPrompt.trim() || saving}
                className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans text-sm">
                {saving ? '저장 중...' : chatbot ? '수정' : '만들기'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatbotModal;
