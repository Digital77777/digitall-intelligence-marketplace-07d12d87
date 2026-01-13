import React, { useState, useEffect } from 'react';
import { Search, X, Send, Loader2, Users, Check, Megaphone, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { OfficialBadge } from '@/components/ui/official-badge';
import { useOfficialAccounts } from '@/hooks/useOfficialAccounts';
import { MessageMediaUploader } from '@/components/chat/MessageMediaUploader';

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

interface BroadcastMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BroadcastMessageModal: React.FC<BroadcastMessageModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: officialAccounts } = useOfficialAccounts();
  const { sendMessage } = useMessages();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, avatar_url, headline')
          .ilike('full_name', `%${debouncedQuery}%`)
          .neq('user_id', user?.id || '')
          .limit(20);

        if (error) throw error;
        // Filter out already selected users
        const filteredData = (data || []).filter(
          (profile) => !selectedUsers.some((u) => u.user_id === profile.user_id)
        );
        setResults(filteredData);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery, user?.id, selectedUsers]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      setSelectedUsers([]);
      setMessageContent('');
      setSelectedMedia(null);
    }
  }, [open]);

  const getInitials = (name?: string | null) => {
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

  const toggleUserSelection = (profile: UserProfile) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.user_id === profile.user_id);
      if (isSelected) {
        return prev.filter((u) => u.user_id !== profile.user_id);
      } else {
        return [...prev, profile];
      }
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  const isOfficialAccount = (userId: string) => {
    return officialAccounts?.find((a) => a.user_id === userId);
  };

  const handleSendBroadcast = async () => {
    if (selectedUsers.length === 0 || (!messageContent.trim() && !selectedMedia)) {
      toast({
        title: 'Missing information',
        description: 'Please select at least one recipient and enter a message or attach media.',
        variant: 'destructive',
      });
      return;
    }

    if (messageContent.trim().length > 2000) {
      toast({
        title: 'Message too long',
        description: 'Message must be less than 2000 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // Send message to each selected user
      const sendPromises = selectedUsers.map((recipient) =>
        sendMessage.mutateAsync({
          receiverId: recipient.user_id,
          content: messageContent.trim(),
          mediaUrl: selectedMedia?.url,
          mediaType: selectedMedia?.type,
        })
      );

      await Promise.all(sendPromises);

      toast({
        title: 'Broadcast sent!',
        description: `Message sent to ${selectedUsers.length} recipient${selectedUsers.length > 1 ? 's' : ''}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: 'Failed to send broadcast',
        description: 'Some messages may not have been sent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Broadcast Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Recipients ({selectedUsers.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((profile) => (
                  <Badge
                    key={profile.user_id}
                    variant="secondary"
                    className="pl-1 pr-1.5 py-1 gap-1.5 bg-primary/10 text-primary border-0 rounded-full"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-primary/20">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium max-w-[100px] truncate">
                      {profile.full_name || 'Unknown'}
                    </span>
                    <button
                      onClick={() => removeSelectedUser(profile.user_id)}
                      className="ml-0.5 h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <ScrollArea className="flex-1 min-h-0 max-h-[180px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((profile) => {
                  const official = isOfficialAccount(profile.user_id);
                  const isSelected = selectedUsers.some(
                    (u) => u.user_id === profile.user_id
                  );
                  return (
                    <button
                      key={profile.user_id}
                      onClick={() => toggleUserSelection(profile)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {profile.full_name || 'Unknown User'}
                          </p>
                          {official && (
                            <OfficialBadge
                              label={official.badge_label}
                              variant="compact"
                            />
                          )}
                        </div>
                        {profile.headline && (
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.headline}
                          </p>
                        )}
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : searchQuery && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Search className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : !searchQuery ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Search to add recipients
                </p>
              </div>
            ) : null}
          </ScrollArea>

          {/* Message Input with Media */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Message</label>
              <MessageMediaUploader
                onMediaSelected={(url, type) => setSelectedMedia({ url, type })}
                onClear={() => setSelectedMedia(null)}
                selectedMedia={null}
                disabled={isSending}
              />
            </div>
            
            {/* Media Preview */}
            {selectedMedia && (
              <div className="p-3 bg-muted/30 rounded-xl">
                <div className="relative inline-block">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt="Selected media"
                      className="max-h-24 max-w-[150px] rounded-lg object-cover"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={selectedMedia.url}
                        className="max-h-24 max-w-[150px] rounded-lg object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => setSelectedMedia(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedMedia.type === 'image' ? '📷 Photo' : '🎬 Video'} will be sent
                </p>
              </div>
            )}
            
            <Textarea
              placeholder="Type your broadcast message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[100px] bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {messageContent.length}/2000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendBroadcast}
            disabled={
              selectedUsers.length === 0 || (!messageContent.trim() && !selectedMedia) || isSending
            }
            className="rounded-xl gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to {selectedUsers.length || 0} user{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
