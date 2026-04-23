'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  type Conversation,
  type Message,
} from '@/lib/firestore-helpers';
import {
  Send,
  MessageCircle,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatPanelProps {
  userId: string;
  userName: string;
  userRole: 'tailor' | 'customer';
}

function ConversationList({
  conversations,
  activeId,
  userId,
  onSelect,
  searchQuery,
}: {
  conversations: Conversation[];
  activeId: string | null;
  userId: string;
  onSelect: (conv: Conversation) => void;
  searchQuery: string;
}) {
  const filtered = conversations.filter((c) => {
    const name =
      userId === c.tailorId ? c.customerName : c.tailorName;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-xs mt-1">Start chatting with your {userId ? 'customers' : 'tailors'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {filtered.map((conv) => {
        const otherName =
          userId === conv.tailorId ? conv.customerName : conv.tailorName;
        const unread = conv.unreadCount?.[userId] || 0;
        const isActive = activeId === conv.id;
        const time = conv.lastMessageAt?.toDate?.();

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
              isActive
                ? 'bg-primary/10 border border-primary/20'
                : 'hover:bg-muted/50'
            )}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://picsum.photos/seed/${conv.id}/80/80`}
                  alt={otherName}
                />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                  {otherName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn('text-sm font-semibold truncate', unread > 0 && 'text-foreground')}>
                  {otherName}
                </p>
                {time && (
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {format(time, 'h:mm a')}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  'text-xs truncate mt-0.5',
                  unread > 0
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {conv.lastMessage || 'No messages yet'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const time = message.createdAt?.toDate?.();

  return (
    <div
      className={cn(
        'flex mb-3',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.text}</p>
        {time && (
          <p
            className={cn(
              'text-[10px] mt-1',
              isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          >
            {format(time, 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

function ChatThread({
  conversation,
  userId,
  userName,
  onBack,
}: {
  conversation: Conversation;
  userId: string;
  userName: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherName =
    userId === conversation.tailorId
      ? conversation.customerName
      : conversation.tailorName;
  const recipientId =
    userId === conversation.tailorId
      ? conversation.customerId
      : conversation.tailorId;

  useEffect(() => {
    const unsub = subscribeToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
    });
    // Mark as read
    markMessagesAsRead(conversation.id, userId);
    return () => unsub();
  }, [conversation.id, userId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(
        conversation.id,
        userId,
        userName,
        newMessage.trim(),
        recipientId
      );
      setNewMessage('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={`https://picsum.photos/seed/${conversation.id}/80/80`}
            alt={otherName}
          />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">
            {otherName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{otherName}</p>
          <p className="text-[10px] text-emerald-500 font-medium">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === userId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="rounded-full h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ userId, userName, userRole }: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToConversations(userId, setConversations);
    return () => unsub();
  }, [userId]);

  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-2xl border bg-card overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'w-full lg:w-80 border-r flex flex-col shrink-0',
          activeConversation ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold font-headline mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id ?? null}
            userId={userId}
            onSelect={setActiveConversation}
            searchQuery={searchQuery}
          />
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex-1 flex flex-col',
          !activeConversation ? 'hidden lg:flex' : 'flex'
        )}
      >
        {activeConversation ? (
          <ChatThread
            conversation={activeConversation}
            userId={userId}
            userName={userName}
            onBack={() => setActiveConversation(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
              <MessageCircle className="h-20 w-20 mb-4 opacity-30 relative" />
            </div>
            <p className="text-lg font-semibold relative">Select a conversation</p>
            <p className="text-sm mt-1 relative">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
