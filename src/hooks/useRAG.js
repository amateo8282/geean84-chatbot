import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateEmbedding } from '../lib/embedding';

export function useRAG() {
  const buildRAGContext = useCallback(async (userMessage, chatbotId) => {
    if (!isSupabaseConfigured() || !chatbotId) return null;

    try {
      const queryEmbedding = await generateEmbedding(userMessage);
      if (!queryEmbedding) return null;

      const { data, error } = await supabase.rpc('match_knowledge_embeddings', {
        query_embedding: queryEmbedding,
        target_chatbot_id: chatbotId,
        match_threshold: 0.5,
        match_count: 5,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const contextChunks = data.map(item => item.chunk_text).join('\n---\n');

      return `[참고 자료]\n다음은 관련 지식 문서에서 찾은 정보입니다:\n---\n${contextChunks}\n---\n\n위 참고 자료를 바탕으로 다음 질문에 답변하세요:\n${userMessage}`;
    } catch (err) {
      console.error('RAG 컨텍스트 구성 실패:', err);
      return null;
    }
  }, []);

  return { buildRAGContext };
}

export default useRAG;
