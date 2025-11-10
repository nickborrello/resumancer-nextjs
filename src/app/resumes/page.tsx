import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ResumesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  interface Resume {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }

  // Mock resumes data (in real app, fetch from backend API)
  const resumes: Resume[] = [
    // Empty for now - will be populated when backend integration is complete
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-24 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="text-muted-foreground">
              Manage and download your generated resumes
            </p>
          </div>
          <Link href="/builder">
            <Button className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Resume
            </Button>
          </Link>
        </div>

        {resumes.length === 0 ? (
          /* Empty State */
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-amethyst-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-amethyst-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">No Resumes Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven&apos;t created any resumes yet. Start building your professional resume with AI-powered suggestions.
                </p>
              </div>
              <Link href="/builder">
                <Button size="lg" className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700">
                  Create Your First Resume
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Resume List */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="p-6 space-y-4 hover:border-amethyst-500/50 transition-colors">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold line-clamp-1">{resume.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated {new Date(resume.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-amethyst-500/5 border-amethyst-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amethyst-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amethyst-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-amethyst-400">Resume Storage</h4>
              <p className="text-sm text-muted-foreground">
                All your resumes are stored securely in the cloud. You can access them anytime, from any device. Each resume generation costs 1 credit.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
