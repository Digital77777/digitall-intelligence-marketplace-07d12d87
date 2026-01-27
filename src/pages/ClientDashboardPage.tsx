import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Send,
  MessageCircle,
  ExternalLink,
  ClipboardList,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  profile_picture: string | null;
  hourly_rate: number;
}

interface Proposal {
  id: string;
  project_title: string;
  project_description: string;
  budget_type: string;
  budget_amount: number;
  timeline: string;
  deadline: string | null;
  status: string;
  created_at: string;
  freelancer_response: string | null;
  responded_at: string | null;
  freelancer_profile_id: string;
  freelancer_user_id: string;
  freelancer?: FreelancerProfile;
}

interface JobListing {
  id: string;
  title: string;
  description: string;
  listing_type: string;
  price: number | null;
  user_id: string;
}

interface JobApplication {
  id: string;
  job_listing_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  job?: JobListing;
}

const ClientDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposalFilter, setProposalFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    await Promise.all([loadProposals(), loadApplications()]);
    setLoading(false);
  };

  const loadProposals = async () => {
    if (!user) return;
    
    try {
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('freelancer_proposals')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      if (proposalsData && proposalsData.length > 0) {
        const profileIds = [...new Set(proposalsData.map(p => p.freelancer_profile_id))];
        const { data: profilesData } = await supabase
          .from('freelancer_profiles')
          .select('id, name, title, profile_picture, hourly_rate')
          .in('id', profileIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const proposalsWithFreelancers = proposalsData.map(proposal => ({
          ...proposal,
          freelancer: profilesMap.get(proposal.freelancer_profile_id)
        }));

        setProposals(proposalsWithFreelancers);
      } else {
        setProposals([]);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    }
  };

  const loadApplications = async () => {
    if (!user) return;
    
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      if (applicationsData && applicationsData.length > 0) {
        const jobIds = [...new Set(applicationsData.map(a => a.job_listing_id))];
        const { data: jobsData } = await supabase
          .from('marketplace_listings')
          .select('id, title, description, listing_type, price, user_id')
          .in('id', jobIds);

        const jobsMap = new Map(jobsData?.map(j => [j.id, j]) || []);

        const applicationsWithJobs = applicationsData.map(application => ({
          ...application,
          job: jobsMap.get(application.job_listing_id)
        }));

        setApplications(applicationsWithJobs);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600"><Eye className="h-3 w-3 mr-1" />Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFilteredProposals = (filter: string) => {
    if (filter === 'all') return proposals;
    if (filter === 'active') return proposals.filter(p => ['pending', 'accepted'].includes(p.status));
    return proposals.filter(p => p.status === filter);
  };

  const getFilteredApplications = (filter: string) => {
    if (filter === 'all') return applications;
    return applications.filter(a => a.status === filter);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const proposalStats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    completed: proposals.filter(p => p.status === 'completed').length
  };

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-64 animate-pulse" />
              <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <Card>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-6 bg-muted rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Client Dashboard - Track Your Projects"
        description="Track your sent proposals, manage hired freelancers, and monitor project progress."
        keywords={["client dashboard", "freelancer proposals", "project tracking"]}
      />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Track your proposals and manage hired freelancers
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Proposals
              {proposalStats.pending > 0 && (
                <Badge variant="secondary" className="ml-1">{proposalStats.pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Applications
              {applicationStats.pending > 0 && (
                <Badge variant="secondary" className="ml-1">{applicationStats.pending}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            {/* Proposal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{proposalStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{proposalStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{proposalStats.accepted}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{proposalStats.completed}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proposals List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Proposals</CardTitle>
                <CardDescription>Proposals sent to freelancers</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={proposalFilter} onValueChange={setProposalFilter}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All ({proposalStats.total})</TabsTrigger>
                    <TabsTrigger value="active">Active ({proposalStats.pending + proposalStats.accepted})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({proposalStats.pending})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({proposalStats.completed})</TabsTrigger>
                  </TabsList>

                  <TabsContent value={proposalFilter}>
                    {getFilteredProposals(proposalFilter).length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing freelancers to find the perfect match for your project
                    </p>
                    <Button onClick={() => navigate('/marketplace/browse-freelancers')}>
                      <User className="h-4 w-4 mr-2" />
                      Browse Freelancers
                    </Button>
                  </div>
                ) : (
                      <div className="space-y-4">
                        {getFilteredProposals(proposalFilter).map((proposal) => (
                          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex items-start gap-3 md:w-1/4">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={proposal.freelancer?.profile_picture || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {proposal.freelancer ? getInitials(proposal.freelancer.name) : 'FL'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {proposal.freelancer?.name || 'Freelancer'}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {proposal.freelancer?.title || 'AI Professional'}
                                    </p>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0 text-xs"
                                      onClick={() => navigate(`/marketplace/freelancer/${proposal.freelancer_profile_id}`)}
                                    >
                                      View Profile <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold">{proposal.project_title}</h4>
                                    {getStatusBadge(proposal.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {proposal.project_description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <DollarSign className="h-4 w-4" />
                                      ${proposal.budget_amount} ({proposal.budget_type})
                                    </span>
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      {proposal.timeline}
                                    </span>
                                    {proposal.deadline && (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Due: {format(new Date(proposal.deadline), 'MMM d, yyyy')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Sent {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                                  </p>
                                </div>

                                <div className="flex md:flex-col gap-2 md:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/community/inbox?user=${proposal.freelancer_user_id}`)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message
                                  </Button>
                                </div>
                              </div>

                              {proposal.freelancer_response && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Freelancer Response:</p>
                                  <p className="text-sm text-muted-foreground">{proposal.freelancer_response}</p>
                                  {proposal.responded_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Responded {format(new Date(proposal.responded_at), 'MMM d, yyyy')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Application Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{applicationStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{applicationStats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{applicationStats.accepted}</p>
                      <p className="text-sm text-muted-foreground">Accepted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{applicationStats.rejected}</p>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track job applications you've submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={applicationFilter} onValueChange={setApplicationFilter}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All ({applicationStats.total})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({applicationStats.pending})</TabsTrigger>
                    <TabsTrigger value="reviewed">Reviewed ({applicationStats.reviewed})</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted ({applicationStats.accepted})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({applicationStats.rejected})</TabsTrigger>
                  </TabsList>

                  <TabsContent value={applicationFilter}>
                    {getFilteredApplications(applicationFilter).length === 0 ? (
                      <div className="text-center py-12">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Browse job listings to find opportunities
                        </p>
                        <Button onClick={() => navigate('/marketplace/jobs')}>
                          <Briefcase className="h-4 w-4 mr-2" />
                          Browse Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getFilteredApplications(applicationFilter).map((application) => (
                          <Card key={application.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex items-start gap-3 md:w-1/4">
                                  <div className="p-3 rounded-lg bg-primary/10">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {application.job?.title || 'Job Listing'}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {application.job?.listing_type || 'Job'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold">{application.job?.title || 'Job Application'}</h4>
                                    {getStatusBadge(application.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.job?.description || 'No description available'}
                                  </p>
                                  {application.job?.price && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <DollarSign className="h-4 w-4" />
                                      ${application.job.price}
                                    </span>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Applied {format(new Date(application.created_at), 'MMM d, yyyy')}
                                  </p>
                                </div>

                                <div className="flex md:flex-col gap-2 md:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/marketplace/jobs')}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View Job
                                  </Button>
                                </div>
                              </div>

                              {application.cover_letter && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Your Cover Letter:</p>
                                  <p className="text-sm text-muted-foreground line-clamp-3">{application.cover_letter}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientDashboardPage;