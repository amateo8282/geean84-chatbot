import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// 플레이스홀더 이미지들 (실제 이미지로 교체 가능)
const placeholderImages = [
  { id: 1, emoji: '✏️', label: '연필' },
  { id: 2, emoji: '📚', label: '책' },
  { id: 3, emoji: '🎨', label: '팔레트' },
  { id: 4, emoji: '☕', label: '커피' },
  { id: 5, emoji: '🌙', label: '달' },
  { id: 6, emoji: '🏠', label: '집' },
  { id: 7, emoji: '🚶', label: '사람' },
  { id: 8, emoji: '💭', label: '생각' },
];

// 랜덤 위치 생성
function getRandomPosition(index, total) {
  const section = index / total;
  const baseX = (section * 80) + 5; // 5% ~ 85% 범위
  const baseY = Math.random() * 70 + 10; // 10% ~ 80% 범위

  return {
    x: baseX + (Math.random() * 10 - 5),
    y: baseY,
    rotation: Math.random() * 30 - 15, // -15도 ~ 15도
    scale: 0.8 + Math.random() * 0.4, // 0.8 ~ 1.2
  };
}

function FloatingItem({ image, position, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: position.rotation - 20 }}
      animate={{
        opacity: 0.15,
        scale: position.scale,
        rotate: position.rotation,
      }}
      whileHover={{
        opacity: 0.4,
        scale: position.scale * 1.2,
        rotate: 0,
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        type: 'spring',
        stiffness: 100,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute cursor-default select-none pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        fontSize: '3rem',
        filter: 'grayscale(100%)',
        zIndex: 0,
      }}
      title={image.label}
    >
      <span
        style={{
          filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
          transition: 'filter 0.3s ease',
        }}
      >
        {image.emoji}
      </span>
    </motion.div>
  );
}

export function FloatingImages() {
  // 컴포넌트 마운트 시 한 번만 위치 계산 (새로고침 시 랜덤 재배치)
  const positions = useMemo(() => {
    return placeholderImages.map((_, i) =>
      getRandomPosition(i, placeholderImages.length)
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {placeholderImages.map((image, index) => (
        <FloatingItem
          key={image.id}
          image={image}
          position={positions[index]}
          index={index}
        />
      ))}
    </div>
  );
}

export default FloatingImages;
