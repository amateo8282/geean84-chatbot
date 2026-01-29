import { motion } from 'framer-motion';

// Common SVG Filter for "Rough" look
// Should supply this once in the app, but included here for component self-containment.
const SketchyFilter = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <defs>
      <filter id="sketchy">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
      </filter>
    </defs>
  </svg>
);

// 손으로 그린 듯한 테두리 효과 (컨테이너용)
export function DrawnBorder({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <SketchyFilter />
      {/* 손그림 스타일 테두리 - SVG 필터 효과 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none">
        <rect
          x="2"
          y="2"
          width="calc(100% - 4px)"
          height="calc(100% - 4px)"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          rx="8"
          style={{ filter: 'url(#sketchy)' }}
        />
      </svg>
      {children}
    </div>
  );
}

// 말풍선용 손그림 테두리 (SVG + Tail)
export function BubbleBorder({ children, isUser = false, className = '' }) {
  const bgColor = isUser ? 'var(--color-accent-user)' : 'var(--color-accent-bot)';
  const borderColor = 'var(--color-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative z-0 ${className}`} // z-0 creates stacking context
      style={{ padding: '12px 16px' }} // Padding handled here instead of styling the outer div directly
    >
      <SketchyFilter />
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <svg width="100%" height="100%" className="overflow-visible" preserveAspectRatio="none">
          <g style={{ filter: 'url(#sketchy)' }}>
            {/* Main Bubble Body */}
            <rect
              x="2" y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="15" ry="15"
              fill={bgColor}
              stroke={borderColor} strokeWidth="2"
            />

            {/* Tail Implementation */}
            <g transform={isUser ? "translate(0, 20)" : "translate(0, 20)"}>
              {/* Anchor the tail group to the side. For User (right), position at 100% */}
              <svg x={isUser ? "100%" : "2"} y="0" width="20" height="20" className="overflow-visible">
                <path
                  d={isUser ? "M -2 0 L 15 10 L -2 20 Z" : "M 2 0 L -15 10 L 2 20 Z"}
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth="2"
                />
                {/* Cover line for seamless merge */}
                <path
                  d={isUser ? "M -2 2 L -2 18" : "M 2 2 L 2 18"}
                  stroke={bgColor}
                  strokeWidth="4"
                />
              </svg>
            </g>
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default DrawnBorder;
