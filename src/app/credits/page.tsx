import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CreditsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const credits = session.user.credits || 0;
  const subscriptionTier = session.user.subscriptionTier || 'free';

  // Credit packages (in a real app, fetch from API)
  const packages = [
    {
      id: 'basic',
      name: 'Basic Pack',
      credits: 5,
      price: 9.99,
      description: 'Perfect for occasional resume updates',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 15,
      price: 24.99,
      description: 'Best value for job seekers',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 50,
      price: 79.99,
      description: 'For career coaches and recruiters',
      popular: false,
    },
  ];

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

        {/* Current Balance */}
        <Card className="p-8 bg-gradient-to-br from-amethyst-500/10 to-amethyst-600/5 border-amethyst-500/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-amethyst-400 mb-2">Your Credits</h2>
              <p className="text-muted-foreground">
                Current subscription: <span className="capitalize font-semibold text-amethyst-300">{subscriptionTier}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-amethyst-400 to-amethyst-600 bg-clip-text text-transparent">
                  {credits}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Available Credits</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Credit Packages */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Purchase Credits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-6 space-y-6 relative ${
                  pkg.popular
                    ? 'border-amethyst-500 shadow-lg shadow-amethyst-500/20'
                    : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amethyst-500 to-amethyst-600 rounded-full text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl font-bold text-amethyst-400">
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-amethyst-500 to-amethyst-600 hover:from-amethyst-600 hover:to-amethyst-700'
                      : ''
                  }`}
                  variant={pkg.popular ? 'default' : 'outline'}
                  disabled
                >
                  Coming Soon (Stripe Integration)
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* How Credits Work */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">How Credits Work</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amethyst-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amethyst-400 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Generate Resume</h4>
                  <p className="text-sm text-muted-foreground">
                    Each AI-powered resume generation costs 1 credit
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amethyst-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amethyst-400 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">AI Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited AI suggestions while building your resume
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amethyst-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amethyst-400 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Never Expire</h4>
                  <p className="text-sm text-muted-foreground">
                    Your credits never expire and can be used anytime
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amethyst-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amethyst-400 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Free Credits</h4>
                  <p className="text-sm text-muted-foreground">
                    New users start with 3 free credits to try the service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Transaction History</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Your credit purchases and usage will appear here</p>
          </div>
        </Card>
      </div>
    </>
  );
}
