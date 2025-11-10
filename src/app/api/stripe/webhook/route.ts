import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('✅ Payment successful:', {
          sessionId: session.id,
          customerId: session.customer,
          userEmail: session.customer_email,
          metadata: session.metadata,
        });

        // TODO: Update user credits in backend database
        // For now, we'll proxy this to the backend API
        const backendUrl = process.env['BACKEND_API_URL'];
        const userId = session.metadata?.['userId'];
        if (backendUrl && userId) {
          try {
            const response = await fetch(`${backendUrl}/api/credits/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                amount: session.amount_total ? session.amount_total / 100 : 0, // Convert cents to dollars
                sessionId: session.id,
              }),
            });

            if (!response.ok) {
              console.error('⚠️ Failed to update credits in backend');
            } else {
              console.log('✅ Credits updated successfully');
            }
          } catch (error) {
            console.error('⚠️ Error updating credits:', error);
          }
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('⏱️ Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('❌ PaymentIntent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
