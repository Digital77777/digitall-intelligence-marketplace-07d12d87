import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import MobileFooter from '@/components/MobileFooter';
import ProposalForm from '@/components/marketplace/ProposalForm';
import ReviewForm from '@/components/marketplace/ReviewForm';
import ReviewsList from '@/components/marketplace/ReviewsList';
import StarRating from '@/components/marketplace/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  MessageCircle,
  Globe,
  Briefcase,
  ExternalLink,
  Send,
  FileText
} from 'lucide-react';

interface PortfolioItem {
  title: string;
  description: string;
  link?: string;
  image?: string;
}

interface FreelancerProfile {
  id: string;
  user_id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  experience: string | null;
  location: string | null;
  languages: string[];
  availability: string | null;
  profile_picture: string | null;
  portfolio_items: PortfolioItem[];
  is_active: boolean;
}

const FreelancerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const portfolioData = Array.isArray(data.portfolio_items) 
          ? (data.portfolio_items as unknown as PortfolioItem[])
          : [];
        setProfile({
          ...data,
          portfolio_items: portfolioData
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load freelancer profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please sign in to contact this freelancer');
      navigate('/auth');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!profile) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: profile.user_id,
          content: message.trim()
        });

      if (error) throw error;

      toast.success('Message sent successfully!');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="h-10 bg-muted rounded w-24 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-6">
                    <div className="h-32 w-32 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="h-7 bg-muted rounded w-48 animate-pulse" />
                      <div className="h-5 bg-muted rounded w-40 animate-pulse" />
                      <div className="flex gap-4">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card className="sticky top-24">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-20 bg-muted rounded animate-pulse" />
                  <div className="h-32 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <MobileFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Freelancer profile not found</p>
              <Button className="mt-4" onClick={() => navigate('/marketplace/browse-freelancers')}>
                Browse Freelancers
              </Button>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-32 w-32 mx-auto sm:mx-0">
                    <AvatarImage src={profile.profile_picture || undefined} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                    <p className="text-lg text-primary font-medium mt-1">{profile.title}</p>
                    
                    {/* Rating Display */}
                    {ratingStats.totalReviews > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <StarRating rating={ratingStats.averageRating} size="sm" showValue />
                        <span className="text-sm text-muted-foreground">
                          ({ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${profile.hourly_rate}/hr
                      </span>
                      {profile.experience && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {profile.experience}
                        </span>
                      )}
                    </div>

                    {profile.availability && (
                      <Badge variant="secondary" className="mt-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {profile.availability}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            {profile.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language, index) => (
                      <Badge key={index} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Section */}
            {profile.portfolio_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio_items.map((item, index) => (
                      <Card key={index} className="overflow-hidden">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          {item.link && (
                            <a 
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                            >
                              View Project <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Reviews
                    {ratingStats.totalReviews > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {ratingStats.totalReviews}
                      </Badge>
                    )}
                  </CardTitle>
                  {!isOwnProfile && (
                    <ReviewForm
                      freelancerProfileId={profile.id}
                      freelancerUserId={profile.user_id}
                      freelancerName={profile.name}
                      onSuccess={() => setReviewsKey(prev => prev + 1)}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ReviewsList
                  key={reviewsKey}
                  freelancerProfileId={profile.id}
                  onReviewsLoaded={setRatingStats}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact & Proposal Section */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact {profile.name.split(' ')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">${profile.hourly_rate}</p>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>

                <Separator />

                {isOwnProfile ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-3">This is your profile</p>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/marketplace/create-freelancer-profile')}
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <Tabs defaultValue="proposal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="proposal" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Proposal
                      </TabsTrigger>
                      <TabsTrigger value="message" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="proposal" className="mt-4">
                      <ProposalForm
                        freelancerProfileId={profile.id}
                        freelancerUserId={profile.user_id}
                        freelancerName={profile.name}
                        hourlyRate={profile.hourly_rate}
                      />
                    </TabsContent>
                    <TabsContent value="message" className="mt-4 space-y-4">
                      <Textarea
                        placeholder={`Hi ${profile.name.split(' ')[0]}, I'd like to discuss a project with you...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                      <Button 
                        className="w-full" 
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !message.trim()}
                      >
                        {sendingMessage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        {user ? 'Your message will be sent directly to the freelancer' : 'Sign in to send a message'}
                      </p>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileFooter />
    </div>
  );
};

export default FreelancerProfilePage;
