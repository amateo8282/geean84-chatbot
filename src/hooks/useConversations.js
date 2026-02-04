import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, chatbot_id, title, total_prompt_tokens, total_completion_tokens, total_tokens, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('대화 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (title = '새 대화', chatbotId = null) => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title, chatbot_id: chatbotId })
        .select()
        .single();

      if (error) throw error;
      setConversations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('대화 생성 실패:', err);
      return null;
    }
  }, []);

  const updateConversation = useCallback(async (id, updates) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      );
    } catch (err) {
      console.error('대화 업데이트 실패:', err);
    }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('대화 삭제 실패:', err);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));
    } catch (err) {
      console.error('메시지 로드 실패:', err);
      return [];
    }
  }, []);

  const saveMessages = useCallback(async (conversationId, userMsg, aiMsg, tokenUsage) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { error: msgError } = await supabase.from('messages').insert([
        {
          conversation_id: conversationId,
          role: 'user',
          content: userMsg.content,
        },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: aiMsg.content,
          prompt_tokens: tokenUsage.promptTokens,
          completion_tokens: tokenUsage.completionTokens,
          total_tokens: tokenUsage.totalTokens,
        },
      ]);

      if (msgError) throw msgError;

      // Update conversation title + token counts
      const conv = conversations.find(c => c.id === conversationId);
      const updates = {
        total_prompt_tokens: (conv?.total_prompt_tokens || 0) + tokenUsage.promptTokens,
        total_completion_tokens: (conv?.total_completion_tokens || 0) + tokenUsage.completionTokens,
        total_tokens: (conv?.total_tokens || 0) + tokenUsage.totalTokens,
      };

      if (conv?.title === '새 대화') {
        updates.title = userMsg.content.length > 30
          ? userMsg.content.slice(0, 30) + '...'
          : userMsg.content;
      }

      await updateConversation(conversationId, updates);
    } catch (err) {
      console.error('메시지 저장 실패:', err);
    }
  }, [conversations, updateConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    loadMessages,
    saveMessages,
  };
}

export default useConversations;
