import { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { ChatContainer } from './components/ChatContainer';
import { ChatbotModal } from './components/ChatbotModal';
import { FloatingImages } from './components/FloatingImage';
import { useGemini } from './hooks/useGemini';
import { useConversations } from './hooks/useConversations';
import { useChatbots } from './hooks/useChatbots';
import { useRAG } from './hooks/useRAG';
import { isSupabaseConfigured } from './lib/supabase';

function AppContent() {
  const {
    toggleSidebar,
    activeConversationId, setActiveConversationId,
    activeChatbot, setActiveChatbot,
  } = useAppContext();

  const {
    messages, isLoading, error, tokenUsage,
    sendMessage, initialize,
    loadConversation, startNewConversation,
    onMessageCompleteRef, ragContextBuilderRef,
  } = useGemini();

  const {
    conversations, createConversation, deleteConversation,
    loadMessages, saveMessages,
  } = useConversations();

  const { chatbots, createChatbot, updateChatbot } = useChatbots();
  const { buildRAGContext } = useRAG();

  const [chatbotModalOpen, setChatbotModalOpen] = useState(false);
  const [editingChatbot, setEditingChatbot] = useState(null);
  const conversationIdRef = useRef(null);

  useEffect(() => {
    conversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Initialize Gemini on mount
  useEffect(() => {
    const success = initialize();
    if (!success) {
      console.warn('Gemini API가 초기화되지 않았습니다. .env 파일에 API 키를 설정하세요.');
    }
  }, [initialize]);

  // Set up RAG context builder
  useEffect(() => {
    ragContextBuilderRef.current = activeChatbot
      ? (userMessage) => buildRAGContext(userMessage, activeChatbot.id)
      : null;
  }, [activeChatbot, buildRAGContext, ragContextBuilderRef]);

  // Set up message complete callback (save to Supabase)
  useEffect(() => {
    onMessageCompleteRef.current = async ({ userMessage, aiMessage, tokenUsage: tokens }) => {
      if (!isSupabaseConfigured()) return;

      let convId = conversationIdRef.current;

      if (!convId) {
        const chatbotId = activeChatbot?.id || null;
        const conv = await createConversation('새 대화', chatbotId);
        if (conv) {
          convId = conv.id;
          conversationIdRef.current = convId;
          setActiveConversationId(convId);
        }
      }

      if (convId) {
        await saveMessages(convId, userMessage, aiMessage, tokens);
      }
    };
  }, [activeChatbot, createConversation, saveMessages, setActiveConversationId, onMessageCompleteRef]);

  const handleSend = useCallback((message, fileData) => {
    sendMessage(message, fileData);
  }, [sendMessage]);

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    conversationIdRef.current = null;
    startNewConversation(activeChatbot?.system_prompt || null);
  }, [activeChatbot, setActiveConversationId, startNewConversation]);

  const handleSelectConversation = useCallback(async (convId) => {
    if (convId === activeConversationId) return;
    setActiveConversationId(convId);
    conversationIdRef.current = convId;

    const msgs = await loadMessages(convId);
    const conv = conversations.find(c => c.id === convId);
    const chatbot = conv?.chatbot_id
      ? chatbots.find(b => b.id === conv.chatbot_id)
      : null;

    if (chatbot) setActiveChatbot(chatbot);
    loadConversation(msgs, chatbot?.system_prompt || null);
  }, [activeConversationId, conversations, chatbots, loadMessages, loadConversation, setActiveConversationId, setActiveChatbot]);

  const handleDeleteConversation = useCallback(async (convId) => {
    await deleteConversation(convId);
    if (convId === activeConversationId) handleNewConversation();
  }, [deleteConversation, activeConversationId, handleNewConversation]);

  const handleSelectChatbot = useCallback((chatbot) => {
    setActiveChatbot(chatbot);
    setActiveConversationId(null);
    conversationIdRef.current = null;
    startNewConversation(chatbot?.system_prompt || null);
  }, [setActiveChatbot, setActiveConversationId, startNewConversation]);

  const handleCreateChatbot = useCallback(() => {
    setEditingChatbot(null);
    setChatbotModalOpen(true);
  }, []);

  const chatbotName = activeChatbot?.name || '기안84';
  const chatbotEmoji = activeChatbot?.avatar_emoji || '✏️';

  return (
    <>
      {/* 배경 플로팅 이미지 */}
      <FloatingImages />

      {/* 우기명 & 봉지은 고정 캐릭터 (데스크탑 전용) */}
      <div className="fixed inset-0 pointer-events-none z-10 hidden xl:block">
        {/* 우기명 (좌측) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute left-[5%] bottom-[10%] w-64"
        >
          <div className="relative p-2 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] transform -rotate-2"
            style={{ filter: 'url(#sketchy)' }}>
            <img
              src="/assets/gimyeong.png"
              alt="우기명"
              className="w-full h-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="absolute -top-4 right-0 bg-yellow-300 border-2 border-black px-3 py-1 text-xl transform rotate-6 shadow-[2px_2px_0px_black]"
              style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
              집중하자 집중!!!
            </div>
          </div>
        </motion.div>

        {/* 봉지은 (우측) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute right-[3%] bottom-[10%] w-80"
        >
          <div className="relative p-2 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)] transform rotate-2"
            style={{ filter: 'url(#sketchy)' }}>
            <img
              src="/assets/jieun.png"
              alt="봉지은"
              className="w-full h-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="absolute -top-6 -left-6 bg-white border-2 border-black px-3 py-1 text-2xl transform -rotate-6 shadow-[2px_2px_0px_black]"
              style={{ fontFamily: "'Nanum Pen Script', cursive" }}>
              갈게 오빠.
            </div>
          </div>
        </motion.div>
      </div>

      {/* 사이드바 + 메인 레이아웃 */}
      <Layout
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
        chatbots={chatbots}
        onSelectChatbot={handleSelectChatbot}
        onCreateChatbot={handleCreateChatbot}
      >
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSend={handleSend}
          onClear={handleNewConversation}
          tokenUsage={tokenUsage}
          chatbotName={chatbotName}
          chatbotEmoji={chatbotEmoji}
          onToggleSidebar={toggleSidebar}
        />
      </Layout>

      {/* 챗봇 생성/편집 모달 */}
      <ChatbotModal
        isOpen={chatbotModalOpen}
        onClose={() => { setChatbotModalOpen(false); setEditingChatbot(null); }}
        onSave={async (data) => {
          if (editingChatbot) {
            await updateChatbot(editingChatbot.id, data);
          } else {
            const newBot = await createChatbot(data);
            if (newBot) handleSelectChatbot(newBot);
          }
          setChatbotModalOpen(false);
          setEditingChatbot(null);
        }}
        chatbot={editingChatbot}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
