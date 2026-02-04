import { useState } from 'react';
import { motion } from 'framer-motion';

export function KnowledgeDocForm({ documents = [], onAdd, onRemove }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({ title: title.trim() || '제목 없음', content: content.trim() });
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-sans">챗봇이 참고할 배경지식 텍스트를 등록하세요.</p>

      {documents.length > 0 && (
        <div className="space-y-1">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm">
              <span className="truncate flex-1"
                style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '0.95rem' }}>
                {doc.title} ({doc.content.length}자)
              </span>
              <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-500 text-xs ml-2">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="문서 제목 (선택)"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-sans focus:outline-none focus:border-gray-400" />
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="배경지식 텍스트를 입력하세요..." rows={4}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm font-sans resize-none focus:outline-none focus:border-gray-400" />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleAdd} disabled={!content.trim()}
          className="w-full py-2 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans">
          + 문서 추가
        </motion.button>
      </div>
    </div>
  );
}

export default KnowledgeDocForm;
