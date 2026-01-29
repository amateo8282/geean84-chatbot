import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ChatInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 텍스트 영역 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 5MB 용량 제한
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFile({
        name: selectedFile.name,
        type: selectedFile.type,
        base64: reader.result.split(',')[1],
        preview: selectedFile.type.startsWith('image/') ? reader.result : null
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((input.trim() || file) && !disabled) {
      onSend(input.trim(), file);
      setInput('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      {/* 파일 업로드 미리보기 */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-4 p-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex items-center gap-2 z-20"
          style={{ filter: 'url(#input-sketchy)' }}
        >
          {file.preview ? (
            <img src={file.preview} alt="preview" className="w-12 h-12 object-cover rounded border border-gray-300" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded border border-gray-300 text-xs text-center font-sans overflow-hidden">
              {file.name.split('.').pop().toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-sans truncate max-w-[150px]">{file.name}</span>
            <button
              type="button"
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-xs text-red-500 hover:text-red-700 text-left underline font-sans"
            >
              제거
            </button>
          </div>
        </motion.div>
      )}

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
        className="relative flex items-center gap-2 p-3 bg-white"
        style={{
          border: '2px solid var(--color-primary)',
          borderRadius: '16px',
          boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
          filter: 'url(#input-sketchy)'
        }}
      >
        {/* 파일 업로드 버튼 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <span className="text-2xl font-bold leading-none">+</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,text/*"
        />

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
            filter: 'none'
          }}
        />
        <motion.button
          type="submit"
          disabled={disabled || (!input.trim() && !file)}
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
        Shift + Enter로 줄바꿈 | 5MB 이하 파일 가능
      </p>
    </form>
  );
}

export default ChatInput;
