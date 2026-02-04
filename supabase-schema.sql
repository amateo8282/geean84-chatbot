-- 기안84 챗봇 RAG 기반 고도화 - Supabase SQL 스키마
-- Supabase SQL Editor에서 실행하세요.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.custom_chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  system_prompt TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🤖',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES public.custom_chatbots(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '새 대화',
  total_prompt_tokens INTEGER DEFAULT 0,
  total_completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES public.custom_chatbots(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '제목 없음',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES public.custom_chatbots(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_updated_at ON public.conversations (updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id, created_at ASC);
CREATE INDEX idx_knowledge_embeddings_chatbot_id ON public.knowledge_embeddings (chatbot_id);
CREATE INDEX idx_knowledge_embeddings_vector ON public.knowledge_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_knowledge_embeddings(
  query_embedding vector(768),
  target_chatbot_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (id UUID, chunk_text TEXT, document_id UUID, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT ke.id, ke.chunk_text, ke.document_id,
    1 - (ke.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_embeddings ke
  WHERE ke.chatbot_id = target_chatbot_id
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

ALTER TABLE public.custom_chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.custom_chatbots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.knowledge_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.knowledge_embeddings FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_chatbots_updated_at BEFORE UPDATE ON public.custom_chatbots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
