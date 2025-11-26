import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-24 mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Skeleton className="h-32 w-32 rounded-full mx-auto sm:mx-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-40" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto mt-1" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
