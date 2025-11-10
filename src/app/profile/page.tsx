import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-6 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and resume details</p>
        </div>

        {/* Personal Information */}
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-amethyst-400">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={session.user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed (OAuth account)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={session.user.name || ''}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="City, State/Country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Portfolio URL</label>
            <Input
              type="url"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub URL</label>
            <Input
              type="url"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-amethyst-400">Account Information</h2>
            <p className="text-sm text-muted-foreground">Your account details</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Account ID</span>
              <span className="text-sm font-mono">{session.user.id}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Credits Available</span>
              <span className="text-sm font-bold text-amethyst-400">{session.user.credits || 0}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Subscription Tier</span>
              <span className="text-sm font-bold capitalize">{session.user.subscriptionTier || 'Free'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email Verified</span>
              <span className="text-sm">
                {session.user.emailVerified ? (
                  <span className="text-green-500">✓ Verified</span>
                ) : (
                  <span className="text-yellow-500">Not Verified</span>
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Coming Soon Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-3 opacity-60">
            <h3 className="text-xl font-bold">Education</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </Card>

          <Card className="p-6 space-y-3 opacity-60">
            <h3 className="text-xl font-bold">Experience</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </Card>

          <Card className="p-6 space-y-3 opacity-60">
            <h3 className="text-xl font-bold">Projects</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </Card>

          <Card className="p-6 space-y-3 opacity-60">
            <h3 className="text-xl font-bold">Skills</h3>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </Card>
        </div>
      </div>
    </>
  );
}
