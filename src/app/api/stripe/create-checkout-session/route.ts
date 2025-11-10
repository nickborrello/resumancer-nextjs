import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-10-29.clover',
});

interface CheckoutRequest {
  priceId: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { priceId, quantity = 1 }: CheckoutRequest = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/credits?canceled=true`,
      metadata: {
        userId: session.user.id || session.user.email,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json(
      {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
