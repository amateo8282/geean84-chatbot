import { motion } from 'framer-motion';

// 손으로 그린 듯한 테두리 효과
export function DrawnBorder({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* 손그림 스타일 테두리 - SVG 필터 효과 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <filter id="sketchy">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
        <rect
          x="2"
          y="2"
          width="calc(100% - 4px)"
          height="calc(100% - 4px)"
          fill="none"
          stroke="#333"
          strokeWidth="2"
          rx="8"
          style={{ filter: 'url(#sketchy)' }}
        />
      </svg>
      {children}
    </div>
  );
}

// 말풍선용 손그림 테두리
export function BubbleBorder({ children, isUser = false, className = '' }) {
  const bgColor = isUser ? '#e8e4d9' : '#fff';
  const borderColor = '#333';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative ${className}`}
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        // 손그림 느낌의 불규칙한 테두리
        borderTopLeftRadius: isUser ? '12px' : '4px',
        borderTopRightRadius: isUser ? '4px' : '12px',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </motion.div>
  );
}

export default DrawnBorder;
