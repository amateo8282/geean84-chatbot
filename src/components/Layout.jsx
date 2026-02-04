import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Sidebar } from './Sidebar';

export function Layout({
  children,
  conversations, onSelectConversation, onDeleteConversation, onNewConversation,
  chatbots, onSelectChatbot, onCreateChatbot,
}) {
  const { sidebarOpen, closeSidebar, activeConversationId, activeChatbot } = useAppContext();

  return (
    <div className="relative flex h-dvh bg-[#f5f5f0]">
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onNewConversation={onNewConversation}
          chatbots={chatbots}
          activeChatbot={activeChatbot}
          onSelectChatbot={onSelectChatbot}
          onCreateChatbot={onCreateChatbot}
        />
      </div>

      {/* 모바일 사이드바 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={id => { onSelectConversation(id); closeSidebar(); }}
                onDeleteConversation={onDeleteConversation}
                onNewConversation={() => { onNewConversation(); closeSidebar(); }}
                chatbots={chatbots}
                activeChatbot={activeChatbot}
                onSelectChatbot={bot => { onSelectChatbot(bot); closeSidebar(); }}
                onCreateChatbot={() => { onCreateChatbot(); closeSidebar(); }}
                onClose={closeSidebar}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 relative">
        {children}
      </div>
    </div>
  );
}

export default Layout;
