import Link from "next/link";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a]">
        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amethyst-400 via-amethyst-500 to-amethyst-600 bg-clip-text text-transparent">
              AI-Powered Resume Builder
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Create professional, ATS-optimized resumes with AI-powered suggestions and necromancer dark theme
            </p>
            
            {session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 text-white shadow-lg shadow-amethyst-500/30 hover:shadow-amethyst-500/50 hover:scale-105 transition-all"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amethyst-500/50 text-amethyst-400 hover:bg-amethyst-500/10"
                  >
                    Create Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700 text-white shadow-lg shadow-amethyst-500/30 hover:shadow-amethyst-500/50 hover:scale-105 transition-all"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 bg-amethyst-500/5 border border-amethyst-500/10 rounded-lg space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amethyst-500 to-amethyst-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amethyst-400">AI-Powered</h3>
              <p className="text-gray-400">
                Get intelligent suggestions to optimize your resume content and increase your chances of landing interviews
              </p>
            </div>

            <div className="p-6 bg-amethyst-500/5 border border-amethyst-500/10 rounded-lg space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amethyst-500 to-amethyst-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amethyst-400">ATS-Optimized</h3>
              <p className="text-gray-400">
                Ensure your resume passes Applicant Tracking Systems with our optimized formatting and keyword suggestions
              </p>
            </div>

            <div className="p-6 bg-amethyst-500/5 border border-amethyst-500/10 rounded-lg space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amethyst-500 to-amethyst-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amethyst-400">Beautiful Design</h3>
              <p className="text-gray-400">
                Stand out with our necromancer-themed dark design that&apos;s both professional and visually stunning
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
