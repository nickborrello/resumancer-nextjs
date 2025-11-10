import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/database/db'
import { users, creditPackages, payments, creditTransactions } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('✅ Payment successful:', {
          sessionId: session.id,
          customerId: session.customer,
          userEmail: session.customer_email,
          metadata: session.metadata,
        })

        // Extract data from the event
        const userId = session.client_reference_id
        const packageId = session.metadata?.['packageId']

        if (!userId || !packageId) {
          console.error('Missing userId or packageId in session metadata')
          return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
        }

        // Determine credits purchased
        const creditPackage = await db
          .select({ credits: creditPackages.credits, price: creditPackages.price })
          .from(creditPackages)
          .where(eq(creditPackages.id, packageId))
          .limit(1)

        if (creditPackage.length === 0) {
          console.error('Credit package not found:', packageId)
          return NextResponse.json({ error: 'Credit package not found' }, { status: 400 })
        }

        const creditsPurchased = creditPackage[0]!.credits
        const amountPaid = session.amount_total || 0 // in cents

        // Perform database transaction
        await db.transaction(async (tx) => {
          // Increment user credits
          await tx
            .update(users)
            .set({ credits: sql`${users.credits} + ${creditsPurchased}` })
            .where(eq(users.id, userId))

          // Create payment record
          await tx.insert(payments).values({
            userId,
            stripePaymentIntentId: session.payment_intent as string,
            stripeSessionId: session.id,
            amount: amountPaid,
            creditsPurchased,
            status: 'completed',
          })

          // Create credit transaction record
          await tx.insert(creditTransactions).values({
            userId,
            type: 'purchase',
            amount: creditsPurchased,
            description: `Purchased ${creditsPurchased} credits`,
            paymentId: session.id,
          })
        })

        console.log('✅ Credits updated successfully:', {
          userId,
          creditsAdded: creditsPurchased,
          newBalance: 'updated in db',
        })

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('⏱️ Checkout session expired:', session.id)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('✅ PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('❌ PaymentIntent failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
