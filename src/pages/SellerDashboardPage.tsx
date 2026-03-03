import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProposalsList from '@/components/marketplace/ProposalsList';
import { JobApplicationsList } from '@/components/marketplace/JobApplicationsList';
import { Package, DollarSign, MessageSquare, Eye, Plus, FileText, Users } from 'lucide-react';
import { useSellerDashboard } from '@/hooks/useSellerDashboard';
import {
  SellerDashboardSkeleton,
  SellerFreelancerCard,
  SellerOverviewTab,
  SellerListingsTab,
  SellerAnalyticsTab,
} from '@/components/seller';

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { listings, profile, loading, stats, updateJobApplicationCount } = useSellerDashboard();

  const quickStats = [
    { value: stats.activeListings.toString(), label: 'Active Listings', icon: <Package className="h-8 w-8 text-primary" />, trend: '+12%' },
    { value: `R${stats.totalEarnings.toFixed(0)}`, label: 'Total Earnings', icon: <DollarSign className="h-8 w-8 text-primary" />, trend: 'Coming Soon' },
    { value: stats.totalViews.toString(), label: 'Profile Views', icon: <Eye className="h-8 w-8 text-primary" />, trend: '+8%' },
    { value: stats.unreadMessages.toString(), label: 'Unread Messages', icon: <MessageSquare className="h-8 w-8 text-primary" />, trend: '' },
  ];

  if (loading) return <SellerDashboardSkeleton />;

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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Track your listings and performance</p>
          </div>
          <Button onClick={() => navigate('/marketplace/create')}>
            <Plus className="h-4 w-4 mr-2" />New Listing
          </Button>
        </div>

        <SellerFreelancerCard profile={profile} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                  {stat.trend && <Badge variant="secondary" className="text-xs">{stat.trend}</Badge>}
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
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">{stats.pendingProposals}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">
              Job Apps
              {stats.pendingJobApplications > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">{stats.pendingJobApplications}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><SellerOverviewTab stats={stats} /></TabsContent>

          <TabsContent value="proposals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Project Proposals</CardTitle>
                <CardDescription>Review and respond to project proposals from clients</CardDescription>
              </CardHeader>
              <CardContent><ProposalsList type="received" /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Job Applications</CardTitle>
                <CardDescription>Review and manage applications for your job postings</CardDescription>
              </CardHeader>
              <CardContent><JobApplicationsList onApplicationCountChange={updateJobApplicationCount} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6"><SellerListingsTab listings={listings} /></TabsContent>
          <TabsContent value="analytics" className="space-y-6"><SellerAnalyticsTab stats={stats} /></TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Client Messages</CardTitle>
                <CardDescription>
                  {stats.unreadMessages > 0 ? `You have ${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? 's' : ''}` : 'All caught up!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/community/inbox')} variant="outline" className="w-full">Go to Inbox</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
