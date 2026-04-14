import React, { createContext, useContext } from 'react';
import { useUnreadMessagesInternal } from '@/hooks/useUnreadMessages';

type UnreadMessagesContextType = ReturnType<typeof useUnreadMessagesInternal>;

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const value = useUnreadMessagesInternal();
  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error('useUnreadMessages must be used within an UnreadMessagesProvider');
  }
  return context;
}
