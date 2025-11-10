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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] pt-24 px-6 pb-12">
        <ResumeBuilderClient credits={credits} />
      </div>
    </>
  );
}
