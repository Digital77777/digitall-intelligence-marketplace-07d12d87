import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FreelancerCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 space-y-4">
          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>

          {/* Availability */}
          <Skeleton className="h-4 w-32" />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
