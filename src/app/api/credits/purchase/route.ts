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

interface PurchaseRequest {
  packageId: string
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
    const { packageId, quantity = 1 }: PurchaseRequest = await request.json()

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Get package details
    const packageData = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, packageId))
      .limit(1)

    if (!packageData.length) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    const selectedPackage = packageData[0]!

    if (!selectedPackage.stripePriceId) {
      return NextResponse.json(
        { error: 'Package not available for purchase' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPackage.stripePriceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/credits`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        packageId: packageId,
        credits: selectedPackage.credits.toString(),
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      package: {
        id: selectedPackage.id,
        name: selectedPackage.name,
        credits: selectedPackage.credits,
        price: selectedPackage.price,
      }
    })
  } catch (error) {
    console.error('Error creating purchase session:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase session' },
      { status: 500 }
    )
  }
}