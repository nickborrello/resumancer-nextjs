import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CreditsClient } from "./CreditsClient";

export default async function CreditsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const credits = session.user.credits || 0;
  const subscriptionTier = session.user.subscriptionTier || 'free';

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-8 max-w-6xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Credits</h1>
          <p className="text-muted-foreground">
            Purchase credits to generate and optimize your resumes with AI
          </p>
        </div>

        <CreditsClient credits={credits} subscriptionTier={subscriptionTier} />
      </div>
    </>
  );
}
