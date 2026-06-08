import { Bot, Brain, Sparkles, MessageSquare, BookOpen, Target, TrendingUp, Zap, Award, Send, Loader2, Trash2, User, Plus, History, Clock, Download, FileText, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageContent } from '@/components/chat/MessageContent';
import { useAITutorSessions } from '@/hooks/useAITutorSessions';
import { formatDistanceToNow } from 'date-fns';
import { exportToMarkdown, exportToPDF } from '@/lib/conversationExport';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const PersonalAITutorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessions,
    currentSessionId,
    messages,
    setMessages,
    loadSession,
    createSession,
    saveMessage,
    deleteSession,
    startNewConversation
  } = useAITutorSessions(user?.id);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickPrompts = [
    "Explain neural networks in simple terms",
    "How do I start learning machine learning?",
    "What's the difference between AI and ML?",
    "Help me build an AI project portfolio",
    "Best Python libraries for data science",
    "Career path in AI engineering"
  ];

  const streamChat = async (userMessage: string) => {
    const userMsg = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    let sessionId = currentSessionId;
    
    // Create new session if none exists
    if (!sessionId) {
      sessionId = await createSession(userMessage);
      if (!sessionId) {
        toast.error('Failed to create conversation');
        setIsLoading(false);
        return;
      }
    }

    // Save user message
    try {
      await saveMessage(sessionId, userMsg);
    } catch (err) {
      console.error('Failed to save user message:', err);
      // Continue anyway to maintain UI flow, but log the error
    }

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 402) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error(errorData.error || 'Failed to get AI response');
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Final flush of remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Save assistant message even if stream was interrupted (best effort persistence)
      if (assistantContent) {
        try {
          await saveMessage(sessionId, { role: 'assistant', content: assistantContent });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('AI response interrupted. Partially generated content shown.');

      // Save whatever we got before the error
      if (assistantContent) {
        await saveMessage(sessionId, { role: 'assistant', content: assistantContent }).catch(console.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    startNewConversation();
    toast.success('Started new conversation');
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    const title = sessions.find(s => s.id === currentSessionId)?.title || 'AI Tutor Conversation';
    exportToMarkdown(title, messages);
    toast.success('Exported as Markdown');
  };

  const handleExportPDF = () => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    const title = sessions.find(s => s.id === currentSessionId)?.title || 'AI Tutor Conversation';
    exportToPDF(title, messages);
    toast.success('Exported as PDF');
  };

  const tutorFeatures = [
    { icon: <Brain className="h-6 w-6 text-primary" />, title: "Adaptive Learning", description: "AI adjusts to your pace" },
    { icon: <Target className="h-6 w-6 text-primary" />, title: "Personalized Path", description: "Custom curriculum" },
    { icon: <Sparkles className="h-6 w-6 text-primary" />, title: "24/7 Available", description: "Learn anytime" },
    { icon: <TrendingUp className="h-6 w-6 text-primary" />, title: "Track Progress", description: "Real-time insights" }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Your Personal <span className="text-primary">AI Tutor</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized guidance, instant answers, and adaptive learning paths
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tutorFeatures.map((feature, idx) => (
            <Card key={idx} className="text-center p-4">
              <div className="flex flex-col items-center gap-2">
                {feature.icon}
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Chat with AI Tutor
                  </CardTitle>
                  <CardDescription>Ask anything about AI, programming, or career guidance</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportMarkdown}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as Markdown
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button variant="outline" size="sm" onClick={handleNewChat}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-12">
                      <Bot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground text-center text-sm max-w-md mb-6">
                        Ask me anything about AI, machine learning, programming, or career development. I'm here to help you learn!
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                        {quickPrompts.slice(0, 3).map((prompt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => streamChat(prompt)}
                            disabled={isLoading}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                          </div>
                          {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-lg px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Ask your AI tutor anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      className="resize-none flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="h-auto"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Chat History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No previous conversations
                  </p>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2 pr-2">
                      {sessions.slice(0, 10).map((session) => (
                        <div
                          key={session.id}
                          className={`group flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                            currentSessionId === session.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => loadSession(session.id)}
                        >
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{session.title}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 text-xs"
                    onClick={() => streamChat(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => navigate('/learning-paths')}>
                  <BookOpen className="h-4 w-4" />
                  Browse Courses
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => navigate('/ai-tools')}>
                  <Sparkles className="h-4 w-4" />
                  AI Tools
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => navigate('/career-certification')}>
                  <Award className="h-4 w-4" />
                  Certifications
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-6 text-center">
                <Bot className="h-10 w-10 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold mb-1">{sessions.length}</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAITutorPage;
