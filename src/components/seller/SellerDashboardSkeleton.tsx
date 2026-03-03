import { Card, CardContent } from '@/components/ui/card';

export const SellerDashboardSkeleton = () => (
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
