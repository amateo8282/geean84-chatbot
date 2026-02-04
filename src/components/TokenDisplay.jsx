import { AnimatePresence, motion } from 'framer-motion';

export function TokenDisplay({ tokenUsage }) {
  const { promptTokens, completionTokens, totalTokens } = tokenUsage;

  if (totalTokens === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-center gap-3 px-4 py-1.5 border-b-2 border-gray-300 bg-[#faf9f5] text-xs font-sans text-gray-500"
      >
        <span>프롬프트: <strong className="text-gray-700">{promptTokens.toLocaleString()}</strong></span>
        <span className="text-gray-300">|</span>
        <span>응답: <strong className="text-gray-700">{completionTokens.toLocaleString()}</strong></span>
        <span className="text-gray-300">|</span>
        <span>합계: <strong className="text-gray-700">{totalTokens.toLocaleString()}</strong></span>
      </motion.div>
    </AnimatePresence>
  );
}

export default TokenDisplay;
