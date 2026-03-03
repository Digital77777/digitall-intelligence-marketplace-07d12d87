import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SellerStats } from '@/hooks/useSellerDashboard';

interface Props {
  stats: SellerStats;
}

const earningsData = [
  { month: 'Jan', earnings: 0 },
  { month: 'Feb', earnings: 0 },
  { month: 'Mar', earnings: 0 },
  { month: 'Apr', earnings: 0 },
  { month: 'May', earnings: 0 },
  { month: 'Jun', earnings: 0 },
];

export const SellerAnalyticsTab = ({ stats }: Props) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Analytics
        </CardTitle>
        <CardDescription>Track your listings performance</CardDescription>
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
        <CardDescription>Views and interactions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earningsData.map(d => ({ ...d, views: Math.floor(Math.random() * 100) }))}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} name="Profile Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </div>
);
