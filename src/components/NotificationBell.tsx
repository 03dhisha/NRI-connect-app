import React, { useState } from 'react';
import { Bell, Check, Trash2, X, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  onOpenChat?: (type: 'dm' | 'group', id: string, otherUserId?: string) => void;
}

const NotificationBell = ({ onOpenChat }: NotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { totalUnread, unreadConversations } = useUnreadMessages();
  const totalBadge = unreadCount + totalUnread;
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'notifications' | 'messages'>('messages');

  const handleChatClick = (convo: typeof unreadConversations[0]) => {
    setIsOpen(false);
    if (onOpenChat) {
      onOpenChat(convo.type, convo.id, convo.otherUserId);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-80 max-h-[28rem] bg-card border border-border rounded-xl shadow-floating z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {activeSection === 'notifications' && unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
                    <Check className="w-3 h-3 mr-1" />Mark all read
                  </Button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-border">
              <button
                className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeSection === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveSection('messages')}
              >
                Messages {totalUnread > 0 && <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px]">{totalUnread}</span>}
              </button>
              <button
                className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${activeSection === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveSection('notifications')}
              >
                General {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-[10px]">{unreadCount}</span>}
              </button>
            </div>

            <div className="overflow-y-auto max-h-72">
              {activeSection === 'messages' ? (
                unreadConversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No unread messages</p>
                ) : (
                  unreadConversations.map((convo) => (
                    <div
                      key={`${convo.type}-${convo.id}`}
                      className="p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer bg-primary/5"
                      onClick={() => handleChatClick(convo)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {convo.type === 'dm' ? (
                            <MessageCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <Users className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground truncate">{convo.name}</p>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                              </span>
                              <span className="w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
                          <span className="text-[10px] text-muted-foreground/60">{convo.type === 'dm' ? 'Personal' : 'Group'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}
                      onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
