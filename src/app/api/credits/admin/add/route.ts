import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CreditsService } from '@/services/creditsService'

interface AddCreditsRequest {
  userId: string
  amount: number
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Add proper admin role checking
    // For now, allowing any authenticated user (should be restricted to admins)

    // Parse request body
    const { userId, amount, description }: AddCreditsRequest = await request.json()

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'userId and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Add credits using CreditsService
    const newBalance = await CreditsService.addCredits(
      userId,
      amount,
      description || 'Admin credit adjustment'
    )

    return NextResponse.json({
      message: 'Credits added successfully',
      userId,
      amount,
      newBalance
    })
  } catch (error) {
    console.error('Error adding credits:', error)
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    )
  }
}