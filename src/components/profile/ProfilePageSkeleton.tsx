
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const ProfilePageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Personal Info Skeleton */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 bg-amethyst-500/10" />
          <Skeleton className="h-4 w-1/2 bg-amethyst-500/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-10 w-full bg-amethyst-500/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-10 w-full bg-amethyst-500/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-10 w-full bg-amethyst-500/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-10 w-full bg-amethyst-500/10" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-full bg-amethyst-500/10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-full bg-amethyst-500/10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-full bg-amethyst-500/10" />
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-32 bg-amethyst-500/10" />
        </div>
      </Card>

      {/* Account Information Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 bg-amethyst-500/10" />
          <Skeleton className="h-4 w-1/2 bg-amethyst-500/10" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-4 w-1/3 bg-amethyst-500/10" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-4 w-1/3 bg-amethyst-500/10" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-4 w-1/3 bg-amethyst-500/10" />
          </div>
          <div className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-1/4 bg-amethyst-500/10" />
            <Skeleton className="h-4 w-1/3 bg-amethyst-500/10" />
          </div>
        </div>
      </Card>

      {/* Education Collapsible Section Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-24 bg-amethyst-500/10" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full bg-amethyst-500/10" />
          <Skeleton className="h-10 w-full bg-amethyst-500/10" />
        </div>
      </Card>

      {/* Experience Collapsible Section Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-24 bg-amethyst-500/10" />
        </div>
      </Card>

      {/* Projects Collapsible Section Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-24 bg-amethyst-500/10" />
        </div>
      </Card>

      {/* Skills Collapsible Section Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-1/4 bg-amethyst-500/10" />
          <Skeleton className="h-10 w-24 bg-amethyst-500/10" />
        </div>
      </Card>
    </div>
  );
};

export default ProfilePageSkeleton;
