import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import ResumeBuilderClient from "@/components/ResumeBuilderClient";

export default async function ResumeBuilderPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/');
  }

  // Get user credits from session
  const credits = session.user.credits ?? 0;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-6 max-w-4xl">
        <ResumeBuilderClient credits={credits} />
      </div>
    </>
  );
}
