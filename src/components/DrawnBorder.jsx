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
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: -1 }} // Behind content
      >
        <g style={{ filter: 'url(#sketchy)' }}>
          {/* Main Bubble Body */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="12"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth="2"
          />
          {/* Tail */}
          <path
            d={isUser
              ? "M 100% 20 L 100% 30 L 115 15 Z" // Right tail (placeholder logic, tricky with % in path)
              : "M 0 20 L 0 30 L -15 15 Z"       // Left tail
            }
          // Better approach for tail: Use absolute positioning in CSS or separate SVG?
          // Since we need it to look connected, inside the same filter group is best.
          // But strict coordinate logic with 'd' is hard with % width.
          // Let's use a simpler tail connected to the side.
          // Actually, for responsiveness, we can just draw the tail as a separate polygon 
          // but carefully positioned.
          // Or use a 'use' element or marker?
          // Let's try a fixed offset tail relative to the corner.
          />
          {/* Alternative Tail Implementation: 
              We can't easily use % in 'd' attribute for the start point relative to 100%. 
              So we will use a separate path for the tail that is anchored.
           */}
        </g>
      </svg>

      {/* Re-implementing the visual bubble with separate tail logic for robustness */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <svg width="100%" height="100%" className="overflow-visible">
          <g style={{ filter: 'url(#sketchy)' }}>
            <rect
              x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)"
              rx="15" ry="15"
              fill={bgColor}
              stroke={borderColor} strokeWidth="2"
            />

            {/* Tail Implementation */}
            <g transform={isUser ? "translate(10, 20) scale(-1, 1) translate(-10, 0)" : "translate(0, 20)"}>
              {/* We anchor the tail group to the side. For User (right), we flip it. */}
              <svg x={isUser ? "100%" : "-15"} width="20" height="20" className="overflow-visible">
                <path
                  d="M 15 0 L -5 10 L 15 20 Z"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth="2"
                />
                {/* Cover line for seamless merge */}
                <path
                  d="M 15 2 L 15 18"
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
