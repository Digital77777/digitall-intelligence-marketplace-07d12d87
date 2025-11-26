import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickStats } from '@/components/tier/shared/QuickStats';
import ProposalsList from '@/components/marketplace/ProposalsList';
import { JobApplicationsList } from '@/components/marketplace/JobApplicationsList';
import { Package, DollarSign, MessageSquare, TrendingUp, Plus, Edit, User, MapPin, Clock, Briefcase, FileText, Users, Eye, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
}

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  hourly_rate: number;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  availability: string;
  profile_picture: string;
  is_active: boolean;
}

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalEarnings: 0,
    unreadMessages: 0,
    totalViews: 0,
    pendingProposals: 0,
    pendingJobApplications: 0,
    averageResponseTime: 0,
    proposalAcceptanceRate: 0,
  });

  // Mock data for earnings chart
  const earningsData = [
    { month: 'Jan', earnings: 0 },
    { month: 'Feb', earnings: 0 },
    { month: 'Mar', earnings: 0 },
    { month: 'Apr', earnings: 0 },
    { month: 'May', earnings: 0 },
    { month: 'Jun', earnings: 0 },
  ];

  // Mock data for performance metrics
  const performanceData = [
    { name: 'Profile Views', value: stats.totalViews },
    { name: 'Proposals', value: stats.pendingProposals },
    { name: 'Active Jobs', value: stats.pendingJobApplications },
    { name: 'Messages', value: stats.unreadMessages },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch freelancer profile
      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }
      
      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      setListings(listingsData || []);

      // Calculate stats
      const activeListings = listingsData?.filter(l => l.status === 'active').length || 0;

      // Fetch unread messages count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);

      // Fetch pending proposals count
      const { count: proposalsCount } = await supabase
        .from('freelancer_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_user_id', user?.id)
        .eq('status', 'pending');

      // Fetch pending job applications count (for jobs posted by this user)
      const { data: userJobs } = await supabase
        .from('marketplace_listings')
        .select('id')
        .eq('user_id', user?.id)
        .eq('listing_type', 'job');

      let jobApplicationsCount = 0;
      if (userJobs && userJobs.length > 0) {
        const jobIds = userJobs.map(j => j.id);
        const { count } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .in('job_listing_id', jobIds)
          .eq('status', 'pending');
        jobApplicationsCount = count || 0;
      }

      setStats({
        totalListings: listingsData?.length || 0,
        activeListings,
        totalEarnings: 0, // Placeholder for earnings integration
        unreadMessages: unreadCount || 0,
        totalViews: 0, // Placeholder for views tracking
        pendingProposals: proposalsCount || 0,
        pendingJobApplications: jobApplicationsCount,
        averageResponseTime: 0, // Placeholder for response time tracking
        proposalAcceptanceRate: 0, // Placeholder for acceptance rate tracking
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'sold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const quickStats = [
    {
      value: stats.activeListings.toString(),
      label: 'Active Listings',
      icon: <Package className="h-8 w-8 text-primary" />,
      trend: '+12%',
    },
    {
      value: `R${stats.totalEarnings.toFixed(0)}`,
      label: 'Total Earnings',
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      trend: 'Coming Soon',
    },
    {
      value: stats.totalViews.toString(),
      label: 'Profile Views',
      icon: <Eye className="h-8 w-8 text-primary" />,
      trend: '+8%',
    },
    {
      value: stats.unreadMessages.toString(),
      label: 'Unread Messages',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      trend: '',
    },
  ];

  const handleJobApplicationCountChange = (count: number) => {
    setStats(prev => ({ ...prev, pendingJobApplications: count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 pb-24 md:pb-12">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-48 animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="h-8 bg-muted rounded w-8 animate-pulse" />
                    <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-full animate-pulse" />
              <Card>
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-3">
                      <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-full animate-pulse" />
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pb-24 md:pb-12">
      <SEOHead
        title="Seller Dashboard - Track Your Sales"
        description="Manage your marketplace listings, track earnings, and monitor performance analytics"
        keywords={["seller dashboard", "marketplace", "earnings", "analytics"]}
      />
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your listings and performance
            </p>
          </div>
          <Button onClick={() => navigate('/marketplace/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>

        {/* Freelancer Profile Card */}
        {profile ? (
          <Card className="mb-8 overflow-hidden border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Freelancer Profile
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/marketplace/create-freelancer-profile')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Badge variant={profile.is_active ? "default" : "secondary"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    <AvatarImage src={profile.profile_picture} alt={profile.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                    <p className="text-lg text-muted-foreground">{profile.title}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">${profile.hourly_rate}/hr</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.availability && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 6 && (
                      <Badge variant="outline">
                        +{profile.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-dashed">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Create Your Freelancer Profile</h3>
              <p className="text-muted-foreground mb-4">
                Set up your profile to start offering freelance services and attract clients
              </p>
              <Button onClick={() => navigate('/marketplace/create-freelancer-profile')}>
                <User className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                  {stat.trend && (
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proposals">
              Proposals
              {stats.pendingProposals > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {stats.pendingProposals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">
              Job Apps
              {stats.pendingJobApplications > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {stats.pendingJobApplications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Overview
                  </CardTitle>
                  <CardDescription>
                    Track your revenue over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 Payment integration coming soon. Connect your payment method to start receiving earnings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Your activity across different areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.proposalAcceptanceRate}%</p>
                      <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.averageResponseTime}h</p>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingProposals + stats.pendingJobApplications}</p>
                      <p className="text-sm text-muted-foreground">Active Opportunities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Proposals
                </CardTitle>
                <CardDescription>
                  Review and respond to project proposals from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProposalsList type="received" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Job Applications
                </CardTitle>
                <CardDescription>
                  Review and manage applications for your job postings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobApplicationsList onApplicationCountChange={handleJobApplicationCountChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  Manage all your marketplace listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No listings yet</p>
                    <Button onClick={() => navigate('/marketplace/create')}>
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.title}</TableCell>
                          <TableCell>
                            {listing.currency} {listing.price?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(listing.status)}>
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/edit-listing/${listing.id}`)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>
                    Track your listings performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-3xl font-bold">{stats.totalListings}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-3xl font-bold text-green-500">{stats.activeListings}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold">{stats.totalViews}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg. Views per Listing</p>
                    <p className="text-3xl font-bold">
                      {stats.totalListings > 0 ? (stats.totalViews / stats.totalListings).toFixed(1) : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>
                    Views and interactions over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData.map(d => ({ ...d, views: Math.floor(Math.random() * 100) }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Profile Views" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Messages
                </CardTitle>
                <CardDescription>
                  {stats.unreadMessages > 0
                    ? `You have ${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? 's' : ''}`
                    : 'All caught up!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/community/inbox')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Inbox
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
