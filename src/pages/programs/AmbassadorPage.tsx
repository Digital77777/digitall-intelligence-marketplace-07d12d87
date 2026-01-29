import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityPrograms } from '@/hooks/useCommunityPrograms';
import { ProgramHero } from '@/components/programs/ProgramHero';
import { StatsCard } from '@/components/programs/StatsCard';
import { RewardTierCard } from '@/components/programs/RewardTierCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Users, TrendingUp, DollarSign, Calendar,
  Medal, Award, Trophy, Star,
  Check, Clock, Send, ExternalLink,
  Twitter, Linkedin, Instagram, Youtube
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AmbassadorPage() {
  const { user } = useAuth();
  const { ambassadorApplication, ambassadorStats, loading, submitAmbassadorApplication } = useCommunityPrograms();
  
  const [applicationText, setApplicationText] = useState('');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApproved = ambassadorApplication?.status === 'approved';
  const isPending = ambassadorApplication?.status === 'pending';
  const hasApplied = !!ambassadorApplication;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationText || !motivation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const result = await submitAmbassadorApplication(applicationText, motivation, experience, socialLinks);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Application submitted successfully! We\'ll review it shortly.');
    }
  };

  const ambassadorTiers = [
    {
      icon: Medal,
      name: 'Bronze Ambassador',
      description: 'Getting started',
      requirements: 'Application approved',
      perks: ['Ambassador badge', 'Exclusive Discord channel', 'Monthly newsletter', 'Priority support'],
      isUnlocked: isApproved,
      isCurrent: isApproved && (!ambassadorStats || ambassadorStats.tier === 'bronze'),
      progress: 30,
      color: 'bg-amber-600'
    },
    {
      icon: Award,
      name: 'Silver Ambassador',
      description: '3 months active',
      requirements: '10+ referrals, 5+ content pieces',
      perks: ['Silver badge', '10% revenue share boost', 'Co-branded materials', 'Quarterly call with team'],
      isUnlocked: ambassadorStats?.tier === 'silver' || ambassadorStats?.tier === 'gold' || ambassadorStats?.tier === 'platinum',
      isCurrent: ambassadorStats?.tier === 'silver',
      progress: 60,
      color: 'bg-gray-400'
    },
    {
      icon: Trophy,
      name: 'Gold Ambassador',
      description: '6 months active',
      requirements: '25+ referrals, 15+ content pieces, 2+ events',
      perks: ['Gold badge', '15% revenue share boost', 'Speaking opportunities', 'Annual retreat invitation'],
      isUnlocked: ambassadorStats?.tier === 'gold' || ambassadorStats?.tier === 'platinum',
      isCurrent: ambassadorStats?.tier === 'gold',
      progress: 80,
      color: 'bg-yellow-500'
    },
    {
      icon: Crown,
      name: 'Platinum Ambassador',
      description: '12 months active',
      requirements: '50+ referrals, 30+ content pieces, 5+ events',
      perks: ['Platinum badge', '20% revenue share boost', 'Equity consideration', 'Direct product input', 'All-expenses-paid summit'],
      isUnlocked: ambassadorStats?.tier === 'platinum',
      isCurrent: ambassadorStats?.tier === 'platinum',
      progress: 100,
      color: 'bg-cyan-500'
    }
  ];

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <Skeleton className="h-96 w-full" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl pb-20 md:pb-0">
      {/* Hero */}
      <ProgramHero
        icon={Crown}
        title="Ambassador Loyalty Program"
        description="Become an official DIM Ambassador and earn rewards, recognition, and exclusive opportunities for promoting and growing our community."
        badge="Exclusive Program"
      />

      {/* Status Banner */}
      {isPending && (
        <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="py-4 flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">Application Under Review</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">We're reviewing your application. You'll hear back within 5-7 business days.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-4 flex items-center gap-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">Welcome, Ambassador! 🎉</p>
              <p className="text-sm text-green-700 dark:text-green-300">You're officially part of the DIM Ambassador program.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ambassador Dashboard (if approved) */}
      {isApproved && (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <StatsCard
              icon={Users}
              label="Referrals This Month"
              value={ambassadorStats?.referrals_count || 0}
            />
            <StatsCard
              icon={TrendingUp}
              label="Content Created"
              value={ambassadorStats?.content_created || 0}
            />
            <StatsCard
              icon={Calendar}
              label="Events Hosted"
              value={ambassadorStats?.events_hosted || 0}
            />
            <StatsCard
              icon={DollarSign}
              label="Total Earnings"
              value={`R${ambassadorStats?.total_earnings?.toLocaleString() || 0}`}
              iconColor="text-green-500"
            />
          </div>
        </>
      )}

      <Tabs defaultValue={isApproved ? 'dashboard' : 'apply'} className="mb-8">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
          <TabsTrigger value="apply" disabled={isApproved}>Apply</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Perks</TabsTrigger>
          <TabsTrigger value="dashboard" disabled={!isApproved}>Dashboard</TabsTrigger>
        </TabsList>

        {/* Application Form */}
        <TabsContent value="apply">
          {hasApplied ? (
            <Card>
              <CardContent className="py-12 text-center">
                {isPending ? (
                  <>
                    <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-2xl font-bold mb-2">Application Pending</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your application is being reviewed. We'll notify you once a decision has been made.
                    </p>
                  </>
                ) : (
                  <>
                    <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-2xl font-bold mb-2">You're an Ambassador!</h3>
                    <p className="text-muted-foreground">Check the Dashboard tab to see your stats and perks.</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Apply to Become an Ambassador</CardTitle>
                <CardDescription>
                  Tell us about yourself and why you'd be a great fit for the DIM Ambassador program.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="applicationText">Why do you want to be an Ambassador? *</Label>
                    <Textarea
                      id="applicationText"
                      placeholder="Tell us about your interest in AI education and community building..."
                      value={applicationText}
                      onChange={(e) => setApplicationText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation">What motivates you to help others learn? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share your motivation for teaching and mentoring..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Relevant Experience (optional)</Label>
                    <Textarea
                      id="experience"
                      placeholder="Any relevant experience in community management, content creation, or education..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Social Media Links (optional)</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Twitter/X URL"
                          value={socialLinks.twitter}
                          onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="LinkedIn URL"
                          value={socialLinks.linkedin}
                          onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Instagram URL"
                          value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="YouTube URL"
                          value={socialLinks.youtube}
                          onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tiers */}
        <TabsContent value="tiers">
          <div className="grid gap-6 md:grid-cols-2">
            {ambassadorTiers.map((tier, index) => (
              <RewardTierCard key={index} {...tier} />
            ))}
          </div>
        </TabsContent>

        {/* Dashboard (for approved ambassadors) */}
        <TabsContent value="dashboard">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Share Referral Link', icon: ExternalLink, href: '/programs/referral-rewards' },
                  { label: 'Create Content', icon: TrendingUp, href: '/community/share-insight' },
                  { label: 'Host an Event', icon: Calendar, href: '/community/host-event' },
                  { label: 'View Resources', icon: Star, href: '#' },
                ].map((action, index) => (
                  <Button key={index} variant="outline" className="w-full justify-start gap-3" asChild>
                    <a href={action.href}>
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Ambassador Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Your Active Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Ambassador Discord Channel Access',
                  'Monthly Newsletter',
                  'Priority Customer Support',
                  '10% Marketplace Commission Boost',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Program Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Program Requirements</CardTitle>
          <CardDescription>What we look for in our ambassadors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Active Community Member', description: 'Regular participation in DIM community activities' },
              { title: 'Content Creation', description: 'Willingness to create educational content about AI' },
              { title: 'Positive Influence', description: 'Track record of helping and mentoring others' },
            ].map((req, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 text-center">
                <Star className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h4 className="font-semibold mb-1">{req.title}</h4>
                <p className="text-sm text-muted-foreground">{req.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
