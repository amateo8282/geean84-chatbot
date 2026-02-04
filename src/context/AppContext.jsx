import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeChatbot, setActiveChatbot] = useState(null);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AppContext.Provider value={{
      sidebarOpen, setSidebarOpen, toggleSidebar, closeSidebar,
      activeConversationId, setActiveConversationId,
      activeChatbot, setActiveChatbot,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
