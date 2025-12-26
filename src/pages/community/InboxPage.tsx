import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Search, MoreVertical, Check, X, Users, Mic, Square, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useConnections } from '@/hooks/useConnections';
import { Separator } from '@/components/ui/separator';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { VoiceNotePlayer } from '@/components/chat/VoiceNotePlayer';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ReplyPreview } from '@/components/chat/ReplyPreview';
import { QuotedMessage } from '@/components/chat/QuotedMessage';
import { MessageActions } from '@/components/chat/MessageActions';

const InboxPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    searchParams.get('userId') || undefined
  );
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { useConversations, useConversationMessages, sendMessage, editMessage, deleteMessage, canModifyMessage } = useMessages();
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useConversationMessages(selectedUserId);
  
  const { usePendingRequests, useAcceptedConnections, acceptConnectionRequest, ignoreConnectionRequest } = useConnections();
  const { data: pendingRequests = [] } = usePendingRequests();
  const { data: acceptedConnections = [], isLoading: connectionsLoading } = useAcceptedConnections();

  const selectedConversation = conversations?.find((c) => c.user_id === selectedUserId);

  // Enable real-time message notifications
  useRealtimeMessages();

  // Voice recording
  const { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  // Typing indicator
  const { isOtherUserTyping, startTyping, stopTyping } = useTypingIndicator(selectedUserId);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendVoiceNote = async () => {
    const voiceNoteUrl = await stopRecording();
    if (voiceNoteUrl && selectedUserId) {
      await sendMessage.mutateAsync({
        receiverId: selectedUserId,
        content: '🎤 Voice note',
        voiceNoteUrl,
      });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update URL when conversation is selected
  useEffect(() => {
    if (selectedUserId) {
      setSearchParams({ userId: selectedUserId });
    } else {
      setSearchParams({});
    }
  }, [selectedUserId, setSearchParams]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    // Validate message length
    if (messageText.trim().length > 2000) {
      toast({
        title: 'Message too long',
        description: 'Message must be less than 2000 characters',
        variant: 'destructive',
      });
      return;
    }

    await sendMessage.mutateAsync({
      receiverId: selectedUserId,
      content: messageText.trim(),
      replyToId: replyToMessage?.id,
    });

    stopTyping();
    setMessageText('');
    setReplyToMessage(null);
  };

  const handleReply = (msg: Message) => {
    setReplyToMessage(msg);
    inputRef.current?.focus();
  };

  const getInitials = (name?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const filteredConversations = conversations?.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    return conv.full_name?.toLowerCase().includes(searchLower);
  });

  const filteredConnections = acceptedConnections?.filter((conn) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conn.connected_user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border bg-card p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/community')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`${
            selectedUserId ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-80 lg:w-96 border-r border-border bg-card`}
        >
          {/* Desktop Header */}
          <div className="hidden md:flex items-center gap-3 p-4 border-b border-border">
            <Button variant="ghost" size="icon" onClick={() => navigate('/community')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Connection Requests */}
          {pendingRequests.length > 0 && (
            <div className="p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Connection Requests</p>
                <Badge variant="secondary" className="text-xs">
                  {pendingRequests.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-2 rounded-lg bg-card border border-border space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(request.requester?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {request.requester?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            wants to connect
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                          onClick={() => acceptConnectionRequest.mutate(request.id)}
                          disabled={acceptConnectionRequest.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => ignoreConnectionRequest.mutate(request.id)}
                          disabled={ignoreConnectionRequest.isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="mt-3" />
            </div>
          )}

          {/* Connected Members */}
          {filteredConnections && filteredConnections.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">My Connections</p>
                <Badge variant="secondary" className="text-xs">
                  {filteredConnections.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {filteredConnections.map((conn) => (
                    <button
                      key={conn.id}
                      onClick={() => setSelectedUserId(conn.connected_user?.user_id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors ${
                        selectedUserId === conn.connected_user?.user_id ? 'bg-accent' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conn.connected_user?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(conn.connected_user?.full_name || undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">
                          {conn.connected_user?.full_name || 'Unknown User'}
                        </p>
                        {conn.connected_user?.headline && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conn.connected_user.headline}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="mt-3" />
            </div>
          )}

          {connectionsLoading && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedUserId(conv.user_id)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors ${
                      selectedUserId === conv.user_id ? 'bg-accent' : ''
                    }`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(conv.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p 
                          className="font-semibold text-sm truncate hover:text-primary cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${conv.user_id}`);
                          }}
                        >
                          {conv.full_name || 'Unknown User'}
                        </p>
                        {conv.last_message_time && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.last_message_time), {
                              addSuffix: false,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message || 'No messages yet'}
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0 h-5 min-w-5 rounded-full">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-muted-foreground mb-2">No conversations yet</p>
                <p className="text-sm text-muted-foreground">
                  Start a conversation with community members!
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedUserId ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedUserId(undefined)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedConversation?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div 
                className="flex-1 min-w-0 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/profile/${selectedUserId}`)}
              >
                <p className="font-semibold text-sm truncate">
                  {selectedConversation?.full_name || 'Unknown User'}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                      <Skeleton className="h-16 w-64 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {messages?.map((msg) => {
                    const isSender = msg.sender_id === user?.id;
                    const isReplyFromCurrentUser = msg.reply_to?.sender_id === user?.id;
                    const canModify = isSender && !msg.voice_note_url && canModifyMessage(msg.created_at);
                    return (
                      <div key={msg.id} className={`group flex items-start gap-2 ${isSender ? 'justify-end' : ''}`}>
                        {!isSender && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(msg)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isSender
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {msg.reply_to && (
                            <QuotedMessage
                              content={msg.reply_to.content}
                              senderName={
                                msg.reply_to.sender_id === selectedUserId
                                  ? selectedConversation?.full_name
                                  : undefined
                              }
                              isCurrentUserSender={isReplyFromCurrentUser}
                              isSentByMe={isSender}
                            />
                          )}
                          {msg.voice_note_url ? (
                            <VoiceNotePlayer audioUrl={msg.voice_note_url} isSender={isSender} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p
                              className={`text-xs ${
                                isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                            {canModify && (
                              <MessageActions
                                messageId={msg.id}
                                content={msg.content}
                                canModify={canModify}
                                onEdit={(id, content) => editMessage.mutate({ messageId: id, content })}
                                onDelete={(id) => deleteMessage.mutate(id)}
                                isEditing={false}
                                isPending={editMessage.isPending || deleteMessage.isPending}
                              />
                            )}
                          </div>
                        </div>
                        {isSender && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(msg)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {isOtherUserTyping && (
                    <TypingIndicator userName={selectedConversation?.full_name || undefined} />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border bg-card">
              {replyToMessage && (
                <ReplyPreview
                  replyToMessage={{
                    id: replyToMessage.id,
                    content: replyToMessage.content,
                    sender_id: replyToMessage.sender_id,
                  }}
                  senderName={
                    replyToMessage.sender_id === user?.id
                      ? undefined
                      : selectedConversation?.full_name
                  }
                  isCurrentUser={replyToMessage.sender_id === user?.id}
                  onCancel={() => setReplyToMessage(null)}
                />
              )}
              <div className="p-4">
                {isRecording ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Recording... {formatRecordingTime(recordingDuration)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={cancelRecording}>
                      <X className="h-5 w-5" />
                    </Button>
                    <Button size="icon" onClick={handleSendVoiceNote} className="bg-primary">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage}>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            if (e.target.value.trim()) {
                              startTyping();
                            } else {
                              stopTyping();
                            }
                          }}
                          onBlur={stopTyping}
                          className="flex-1"
                          maxLength={2000}
                        />
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="ghost"
                          onClick={startRecording}
                          disabled={!!messageText.trim()}
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                        <Button type="submit" size="icon" disabled={!messageText.trim()}>
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex justify-end">
                        <span className={`text-xs ${messageText.length > 1900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {messageText.length}/2000
                        </span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Select a conversation</p>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
