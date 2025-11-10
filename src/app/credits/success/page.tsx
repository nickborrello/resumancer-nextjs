import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function CreditsSuccessPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <Card className="p-12 max-w-2xl w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">
              Your credits have been added to your account
            </p>
          </div>

          <div className="bg-gradient-to-br from-amethyst-500/10 to-amethyst-600/5 border border-amethyst-500/30 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-amethyst-400 to-amethyst-600 bg-clip-text text-transparent">
              {session.user.credits || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available Credits</p>
          </div>

          <div className="space-y-3 pt-4">
            <Button asChild className="w-full bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700">
              <Link href="/builder">Start Building Resume</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/credits">View Credits</Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              A receipt has been sent to your email address.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
