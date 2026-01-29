import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ChatInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* SVG Sketchy Filter for Input */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="input-sketchy">
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>

      <div
        className="relative flex items-end gap-2 p-3 bg-white"
        style={{
          border: '2px solid var(--color-primary)',
          borderRadius: '16px',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
          filter: 'url(#input-sketchy)'
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="뭐든 물어봐요..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-lg placeholder-gray-400"
          style={{
            fontFamily: "'Nanum Pen Script', cursive",
            fontSize: '1.25rem',
            lineHeight: '1.6',
            maxHeight: '120px',
            filter: 'none' // Don't filter text itself to keep it readable
          }}
        />
        <motion.button
          type="submit"
          disabled={disabled || !input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-700"
          style={{
            fontFamily: "'Nanum Pen Script', cursive",
            fontSize: '1.1rem',
            border: '1px solid black'
          }}
        >
          보내기
        </motion.button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center font-sans">
        Shift + Enter로 줄바꿈
      </p>
    </form>
  );
}

export default ChatInput;
