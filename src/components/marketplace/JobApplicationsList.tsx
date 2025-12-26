import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, Calendar, Clock, Check, X, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface JobApplication {
  id: string;
  job_listing_id: string;
  applicant_id: string;
  cover_letter: string | null;
  status: string;
  created_at: string;
  job_title?: string;
  applicant_name?: string;
  applicant_avatar?: string;
}

interface JobApplicationsListProps {
  onApplicationCountChange?: (count: number) => void;
}

export const JobApplicationsList = ({ onApplicationCountChange }: JobApplicationsListProps) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedCoverLetter, setExpandedCoverLetter] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // First get all job listings by this user
      const { data: listings, error: listingsError } = await supabase
        .from('marketplace_listings')
        .select('id, title')
        .eq('user_id', user?.id)
        .eq('listing_type', 'job');

      if (listingsError) throw listingsError;

      if (!listings || listings.length === 0) {
        setApplications([]);
        onApplicationCountChange?.(0);
        return;
      }

      const listingIds = listings.map(l => l.id);
      const listingTitles = Object.fromEntries(listings.map(l => [l.id, l.title]));

      // Fetch applications for these listings
      let query = supabase
        .from('job_applications')
        .select('*')
        .in('job_listing_id', listingIds)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: apps, error: appsError } = await query;

      if (appsError) throw appsError;

      // Fetch applicant profiles - use public_profiles for display data
      const applicantIds = [...new Set(apps?.map(a => a.applicant_id) || [])];
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', applicantIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      const enrichedApplications = (apps || []).map(app => ({
        ...app,
        job_title: listingTitles[app.job_listing_id],
        applicant_name: profileMap[app.applicant_id]?.full_name || 'Unknown',
        applicant_avatar: profileMap[app.applicant_id]?.avatar_url || '',
      }));

      setApplications(enrichedApplications);
      
      // Count pending applications
      const pendingCount = enrichedApplications.filter(a => a.status === 'pending').length;
      onApplicationCountChange?.(pendingCount);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success(`Application ${newStatus === 'accepted' ? 'accepted' : newStatus === 'rejected' ? 'rejected' : 'updated'}`);
      
      // Update pending count
      const newPendingCount = applications.filter(a => 
        a.id === applicationId ? newStatus === 'pending' : a.status === 'pending'
      ).length;
      onApplicationCountChange?.(newPendingCount);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
        <p className="text-muted-foreground">
          {filter !== 'all' 
            ? `No ${filter} applications found. Try changing the filter.`
            : 'When candidates apply to your job postings, they will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {applications.map((application) => (
        <Card key={application.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Applicant Info */}
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.applicant_avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {application.applicant_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold">{application.applicant_name}</h4>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Applied for: <span className="font-medium text-foreground">{application.job_title}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(application.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(application.created_at), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateApplicationStatus(application.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {application.status !== 'pending' && (
                  <Select 
                    value={application.status} 
                    onValueChange={(value) => updateApplicationStatus(application.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setExpandedCoverLetter(
                    expandedCoverLetter === application.id ? null : application.id
                  )}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Cover Letter</span>
                  <Eye className="h-4 w-4" />
                </button>
                
                {expandedCoverLetter === application.id && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
