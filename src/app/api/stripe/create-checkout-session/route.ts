import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import Stripe from 'stripe'
import { db } from '@/database/db'
import { creditPackages } from '@/database/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-10-29.clover',
})

interface CheckoutRequest {
  priceId: string
  quantity?: number
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { priceId, quantity = 1 }: CheckoutRequest = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Verify the price ID exists in our credit packages
    const packageData = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.stripePriceId, priceId))
      .limit(1)

    if (!packageData.length) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/credits`,
      metadata: {
        userId: session.user.id,
        packageId: packageData[0]!.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
