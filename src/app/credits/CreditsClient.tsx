'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular: boolean;
  stripePriceId: string; // Stripe Price ID
}

interface CreditsClientProps {
  credits: number;
  subscriptionTier: string;
}

export function CreditsClient({ credits, subscriptionTier }: CreditsClientProps) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  // Credit packages with Stripe Price IDs
  // Note: In production, these would be actual Stripe Price IDs from your Stripe Dashboard
  const packages: CreditPackage[] = [
    {
      id: 'basic',
      name: 'Basic Pack',
      credits: 5,
      price: 9.99,
      description: 'Perfect for occasional resume updates',
      popular: false,
      stripePriceId: 'price_basic_5_credits', // Replace with actual Stripe Price ID
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 15,
      price: 24.99,
      description: 'Best value for job seekers',
      popular: true,
      stripePriceId: 'price_pro_15_credits', // Replace with actual Stripe Price ID
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 50,
      price: 79.99,
      description: 'For career coaches and recruiters',
      popular: false,
      stripePriceId: 'price_enterprise_50_credits', // Replace with actual Stripe Price ID
    },
  ];

  const handlePurchase = async (pkg: CreditPackage) => {
    setLoadingPackage(pkg.id);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: pkg.stripePriceId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setLoadingPackage(null);
    }
  };

  return (
    <div className="space-y-8">
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
                onClick={() => handlePurchase(pkg)}
                disabled={loadingPackage === pkg.id}
              >
                {loadingPackage === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Purchase'
                )}
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
  );
}
