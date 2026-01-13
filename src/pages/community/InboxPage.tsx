import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Search, MoreVertical, Check, X, Users, Mic, Reply, MessageCircle, UserPlus, PenSquare, Megaphone } from 'lucide-react';
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
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { VoiceNotePlayer } from '@/components/chat/VoiceNotePlayer';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ReplyPreview } from '@/components/chat/ReplyPreview';
import { QuotedMessage } from '@/components/chat/QuotedMessage';
import { MessageActions } from '@/components/chat/MessageActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCurrentUserSponsored, useOfficialAccounts } from '@/hooks/useOfficialAccounts';
import { SponsoredUserSearch } from '@/components/chat/SponsoredUserSearch';
import { BroadcastMessageModal } from '@/components/chat/BroadcastMessageModal';
import { OfficialBadge } from '@/components/ui/official-badge';
import { MessageMediaUploader } from '@/components/chat/MessageMediaUploader';
import { MessageMedia } from '@/components/chat/MessageMedia';

const InboxPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  // Check if current user is a sponsored account
  const { isSponsored } = useIsCurrentUserSponsored();
  const { data: officialAccounts } = useOfficialAccounts();
  
  // Helper to check if a user is an official account
  const getOfficialAccount = (userId: string | undefined) => {
    if (!userId || !officialAccounts) return null;
    return officialAccounts.find(a => a.user_id === userId) || null;
  };
  
  // Get userId from URL, but prevent self-messaging
  const urlUserId = searchParams.get('userId');
  const initialUserId = urlUserId && urlUserId !== user?.id ? urlUserId : undefined;
  
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(initialUserId);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<string>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Prevent selecting self
  const handleSelectUser = (userId: string | undefined) => {
    if (userId && userId === user?.id) {
      toast({
        title: 'Cannot message yourself',
        description: 'Please select another user to message.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedUserId(userId);
  };

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
    
    // Allow sending if there's text, media, or both
    if (!selectedUserId) return;
    if (!messageText.trim() && !selectedMedia) return;

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
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
    });

    stopTyping();
    setMessageText('');
    setReplyToMessage(null);
    setSelectedMedia(null);
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

  // Filter out self from conversations
  const filteredConversations = conversations?.filter((conv) => {
    // Exclude self
    if (conv.user_id === user?.id) return false;
    const searchLower = searchQuery.toLowerCase();
    return conv.full_name?.toLowerCase().includes(searchLower);
  });

  const filteredConnections = acceptedConnections?.filter((conn) => {
    // Exclude self
    if (conn.connected_user?.user_id === user?.id) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      conn.connected_user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const totalUnread = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/community')}
            className="hover:bg-accent rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Messages</h1>
            <p className="text-xs text-muted-foreground">
              {acceptedConnections.length} connections
            </p>
          </div>
          {/* Broadcast & New Message buttons for sponsored accounts */}
          {isSponsored && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBroadcast(true)}
                className="rounded-xl gap-2"
              >
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Broadcast</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserSearch(true)}
                className="rounded-xl gap-2"
              >
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">New Message</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sponsored User Search Modal */}
      <SponsoredUserSearch
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onSelectUser={(userId) => {
          handleSelectUser(userId);
          setActiveTab('messages');
        }}
      />

      {/* Broadcast Message Modal */}
      <BroadcastMessageModal
        open={showBroadcast}
        onOpenChange={setShowBroadcast}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations & Connections */}
        <div
          className={`${
            selectedUserId ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-[340px] lg:w-[380px] border-r border-border bg-card`}
        >
          {/* Tabs for Messages & Connections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-3 pt-3">
              <TabsList className="w-full grid grid-cols-2 h-11 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger 
                  value="messages" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 text-sm font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                  {totalUnread > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {totalUnread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="connections" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 text-sm font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>Connections</span>
                  {pendingRequests.length > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'messages' ? 'Search messages...' : 'Search connections...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Messages Tab */}
            <TabsContent value="messages" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                {conversationsLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations && filteredConversations.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.user_id}
                        onClick={() => handleSelectUser(conv.user_id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          selectedUserId === conv.user_id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                            <AvatarImage src={conv.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                              {getInitials(conv.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {conv.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium rounded-full">
                              {conv.unread_count}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <p 
                                className={`font-semibold text-sm truncate ${conv.unread_count > 0 ? 'text-foreground' : 'text-foreground/80'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile/${conv.user_id}`);
                                }}
                              >
                                {conv.full_name || 'Unknown User'}
                              </p>
                              {getOfficialAccount(conv.user_id) && (
                                <OfficialBadge 
                                  label={getOfficialAccount(conv.user_id)?.badge_label} 
                                  variant="compact" 
                                />
                              )}
                            </div>
                            {conv.last_message_time && (
                              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-foreground/70 font-medium' : 'text-muted-foreground'}`}>
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No conversations yet</p>
                    <p className="text-sm text-muted-foreground">
                      Connect with members to start chatting
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="flex-1 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">Pending Requests</p>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                        {pendingRequests.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-3 rounded-xl bg-accent/30 border border-border/50 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-background">
                              <AvatarImage src={request.requester?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
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
                              className="flex-1 h-9 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium"
                              onClick={() => acceptConnectionRequest.mutate(request.id)}
                              disabled={acceptConnectionRequest.isPending}
                            >
                              <Check className="h-4 w-4 mr-1.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 rounded-lg text-sm font-medium"
                              onClick={() => ignoreConnectionRequest.mutate(request.id)}
                              disabled={ignoreConnectionRequest.isPending}
                            >
                              <X className="h-4 w-4 mr-1.5" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Connections */}
                {connectionsLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConnections && filteredConnections.length > 0 ? (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">My Connections</p>
                      <Badge variant="secondary" className="text-xs">
                        {filteredConnections.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {filteredConnections.map((conn) => (
                        <button
                          key={conn.id}
                          onClick={() => {
                            handleSelectUser(conn.connected_user?.user_id);
                            setActiveTab('messages');
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 ${
                            selectedUserId === conn.connected_user?.user_id ? 'bg-accent' : ''
                          }`}
                        >
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                            <AvatarImage src={conn.connected_user?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
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
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No connections yet</p>
                    <p className="text-sm text-muted-foreground">
                      Find members to connect with
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4 rounded-xl"
                      onClick={() => navigate('/community/find-members')}
                    >
                      Find Members
                    </Button>
                  </div>
                ) : null}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Area */}
        {selectedUserId ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/95 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-accent"
                onClick={() => setSelectedUserId(undefined)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar 
                className="w-10 h-10 ring-2 ring-background shadow-sm cursor-pointer"
                onClick={() => navigate(`/profile/${selectedUserId}`)}
              >
                <AvatarImage src={selectedConversation?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                  {getInitials(selectedConversation?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/profile/${selectedUserId}`)}
              >
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
                    {selectedConversation?.full_name || 'Unknown User'}
                  </p>
                  {getOfficialAccount(selectedUserId) && (
                    <OfficialBadge 
                      label={getOfficialAccount(selectedUserId)?.badge_label} 
                      variant="compact" 
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active now
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                      <Skeleton className="h-16 w-64 rounded-2xl" />
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
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                            onClick={() => handleReply(msg)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isSender
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
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
                          {/* Media display */}
                          {msg.media_url && msg.media_type && (
                            <div className="mb-2">
                              <MessageMedia 
                                mediaUrl={msg.media_url} 
                                mediaType={msg.media_type as 'image' | 'video'} 
                                isSender={isSender} 
                              />
                            </div>
                          )}
                          {/* Voice note or text content */}
                          {msg.voice_note_url ? (
                            <VoiceNotePlayer audioUrl={msg.voice_note_url} isSender={isSender} />
                          ) : !msg.media_url || (msg.content && msg.content !== '📷 Photo' && msg.content !== '🎬 Video') ? (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          ) : null}
                          <div className="flex items-center justify-between gap-2 mt-1.5">
                            <p
                              className={`text-[10px] ${
                                isSender ? 'text-primary-foreground/60' : 'text-muted-foreground'
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
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
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
            <div className="border-t border-border bg-card/95 backdrop-blur-sm">
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
              <div className="p-3 md:p-4">
                {isRecording ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Recording... {formatRecordingTime(recordingDuration)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={cancelRecording} className="rounded-full hover:bg-destructive/20">
                      <X className="h-5 w-5" />
                    </Button>
                    <Button size="icon" onClick={handleSendVoiceNote} className="rounded-full bg-primary">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage}>
                    {/* Media Preview for sponsored users */}
                    {selectedMedia && (
                      <div className="mb-2 p-3 bg-muted/30 rounded-xl">
                        <div className="relative inline-block">
                          {selectedMedia.type === 'image' ? (
                            <img
                              src={selectedMedia.url}
                              alt="Selected media"
                              className="max-h-32 max-w-[200px] rounded-lg object-cover"
                            />
                          ) : (
                            <video
                              src={selectedMedia.url}
                              className="max-h-32 max-w-[200px] rounded-lg object-cover"
                              muted
                              playsInline
                            />
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => setSelectedMedia(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedMedia.type === 'image' ? '📷 Photo' : '🎬 Video'} ready to send
                        </p>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      {/* Media Upload Button - Only for sponsored accounts */}
                      {isSponsored && (
                        <MessageMediaUploader
                          onMediaSelected={(url, type) => setSelectedMedia({ url, type })}
                          onClear={() => setSelectedMedia(null)}
                          selectedMedia={null}
                          disabled={sendMessage.isPending}
                        />
                      )}
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          placeholder={selectedMedia ? "Add a caption..." : "Type a message..."}
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
                          className="pr-12 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                          maxLength={2000}
                        />
                        {messageText.length > 1800 && (
                          <span className={`absolute right-3 bottom-3 text-[10px] ${messageText.length > 1900 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {messageText.length}/2000
                          </span>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        onClick={startRecording}
                        disabled={!!messageText.trim() || !!selectedMedia}
                        className="h-11 w-11 rounded-xl hover:bg-accent"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!messageText.trim() && !selectedMedia}
                        className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <p className="text-xl font-semibold mb-2">Your Messages</p>
              <p className="text-muted-foreground">
                Select a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
