import React, { useState, useEffect } from 'react';
import { Search, X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OfficialBadge } from '@/components/ui/official-badge';
import { useOfficialAccounts } from '@/hooks/useOfficialAccounts';

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

interface SponsoredUserSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
}

export const SponsoredUserSearch: React.FC<SponsoredUserSearchProps> = ({
  open,
  onOpenChange,
  onSelectUser,
}) => {
  const { user } = useAuth();
  const { data: officialAccounts } = useOfficialAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
        setResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery, user?.id]);

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

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
    setSearchQuery('');
    setResults([]);
  };

  const isOfficialAccount = (userId: string) => {
    return officialAccounts?.find(a => a.user_id === userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Message Anyone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
              autoFocus
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

          {/* Results */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((profile) => {
                  const official = isOfficialAccount(profile.user_id);
                  return (
                    <button
                      key={profile.user_id}
                      onClick={() => handleSelectUser(profile.user_id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
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
                            <OfficialBadge label={official.badge_label} variant="compact" />
                          )}
                        </div>
                        {profile.headline && (
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.headline}
                          </p>
                        )}
                      </div>
                      <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : searchQuery && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No users found</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Search for any user</p>
                <p className="text-xs text-muted-foreground">
                  As an official account, you can message anyone
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};