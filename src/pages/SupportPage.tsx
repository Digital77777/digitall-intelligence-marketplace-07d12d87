import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HeadphonesIcon, MessageSquare, Phone, Mail, Clock, Crown, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SupportPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('send-support-request', {
        body: {
          subject: subject.trim(),
          message: message.trim(),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send support request');
      }

      toast({
        title: "Message Sent",
        description: "Your priority support request has been received. We'll respond within 15 minutes.",
      });
      setSubject('');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending support request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppChat = () => {
    window.open('https://wa.me/27671642375', '_blank');
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:+27671642375';
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:digitalintelligencemarketplace@gmail.com?subject=Support%20Request';
  };

  const supportChannels = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant messaging with our support team',
      availability: 'Available 24/7',
      action: 'Start Chat',
      onClick: handleWhatsAppChat,
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Direct line to your account manager',
      availability: 'Mon-Fri 8AM-8PM',
      action: 'Call Now',
      onClick: handlePhoneCall,
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Detailed support via email',
      availability: 'Response within 15 min',
      action: 'Send Email',
      onClick: handleEmailSupport,
    }
  ];

  const accountManager = {
    name: 'DIM Support Team',
    role: 'Account Manager',
    email: 'digitalintelligencemarketplace@gmail.com',
    phone: '+27 67 164 2375'
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <HeadphonesIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Priority Support</h1>
          <p className="text-muted-foreground">24/7 dedicated support with personal account manager</p>
        </div>
        <Badge variant="default" className="ml-auto">Career Tier</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Submit a priority support request and get a response within 15 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={isSubmitting}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  placeholder="Please provide details about your inquiry or issue..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isSubmitting}
                  maxLength={5000}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Average response time: 12 minutes</span>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Priority Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Your Account Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  DIM
                </div>
                <div>
                  <p className="font-semibold">{accountManager.name}</p>
                  <p className="text-sm text-muted-foreground">{accountManager.role}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <button 
                  onClick={handleEmailSupport}
                  className="flex items-center gap-3 w-full text-left hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{accountManager.email}</span>
                </button>
                <button 
                  onClick={handlePhoneCall}
                  className="flex items-center gap-3 w-full text-left hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{accountManager.phone}</span>
                </button>
              </div>

              <Button variant="outline" className="w-full" onClick={handlePhoneCall}>
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                '24/7 availability',
                'Sub-15 min response',
                'Direct manager access',
                'Phone support included',
                'Proactive monitoring'
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Support Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <Card key={channel.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>{channel.title}</CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{channel.availability}</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={channel.onClick}>
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
