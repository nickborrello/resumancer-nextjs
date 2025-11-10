import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <Button type="submit" variant="outline">Sign Out</Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Credits</h3>
          <p className="text-3xl font-bold text-primary">{session.user.credits || 0}</p>
          <p className="text-sm text-muted-foreground mt-2">Available resume generations</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Subscription</h3>
          <p className="text-2xl font-bold capitalize">{session.user.subscriptionTier || 'Free'}</p>
          <p className="text-sm text-muted-foreground mt-2">Current plan</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Account</h3>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {session.user.emailVerified ? '✓ Verified' : 'Not verified'}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Session Debug Info</h2>
        <pre className="text-xs overflow-auto p-4 bg-muted rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      </Card>
    </div>
    </>
  );
}
