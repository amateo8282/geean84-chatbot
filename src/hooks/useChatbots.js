import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { chunkText } from '../lib/chunking';
import { generateEmbeddings } from '../lib/embedding';

async function processKnowledgeDocs(chatbotId, knowledgeDocs) {
  if (!knowledgeDocs || knowledgeDocs.length === 0) return;

  for (const doc of knowledgeDocs) {
    const { data: savedDoc, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        chatbot_id: chatbotId,
        title: doc.title,
        content: doc.content,
      })
      .select()
      .single();

    if (docError) {
      console.error('지식 문서 저장 실패:', docError);
      continue;
    }

    const chunks = chunkText(doc.content);
    if (chunks.length === 0) continue;

    const embeddings = await generateEmbeddings(chunks);
    if (embeddings.length === 0) continue;

    const embeddingRows = chunks
      .map((chunk, i) => ({
        document_id: savedDoc.id,
        chatbot_id: chatbotId,
        chunk_index: i,
        chunk_text: chunk,
        embedding: embeddings[i],
      }))
      .filter((_, i) => embeddings[i]);

    if (embeddingRows.length > 0) {
      const { error: embError } = await supabase
        .from('knowledge_embeddings')
        .insert(embeddingRows);

      if (embError) {
        console.error('임베딩 저장 실패:', embError);
      }
    }
  }
}

export function useChatbots() {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChatbots = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_chatbots')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatbots(data || []);
    } catch (err) {
      console.error('챗봇 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChatbot = useCallback(async (data) => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: newBot, error } = await supabase
        .from('custom_chatbots')
        .insert({
          name: data.name,
          description: data.description || '',
          system_prompt: data.system_prompt,
          avatar_emoji: data.avatar_emoji || '🤖',
        })
        .select()
        .single();

      if (error) throw error;

      if (data.knowledgeDocs && data.knowledgeDocs.length > 0) {
        processKnowledgeDocs(newBot.id, data.knowledgeDocs).catch(err =>
          console.error('지식 문서 처리 실패:', err)
        );
      }

      setChatbots(prev => [...prev, newBot]);
      return newBot;
    } catch (err) {
      console.error('챗봇 생성 실패:', err);
      return null;
    }
  }, []);

  const updateChatbot = useCallback(async (id, data) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('custom_chatbots')
        .update({
          name: data.name,
          description: data.description,
          system_prompt: data.system_prompt,
          avatar_emoji: data.avatar_emoji,
        })
        .eq('id', id);

      if (error) throw error;

      if (data.knowledgeDocs && data.knowledgeDocs.length > 0) {
        processKnowledgeDocs(id, data.knowledgeDocs).catch(err =>
          console.error('지식 문서 처리 실패:', err)
        );
      }

      setChatbots(prev =>
        prev.map(b => (b.id === id ? { ...b, ...data } : b))
      );
    } catch (err) {
      console.error('챗봇 업데이트 실패:', err);
    }
  }, []);

  const deleteChatbot = useCallback(async (id) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('custom_chatbots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setChatbots(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('챗봇 삭제 실패:', err);
    }
  }, []);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  return { chatbots, loading, fetchChatbots, createChatbot, updateChatbot, deleteChatbot };
}

export default useChatbots;
