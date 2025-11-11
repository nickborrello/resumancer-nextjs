import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CreditsService } from '@/services/creditsService'

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user credits using CreditsService
    const credits = await CreditsService.getUserCredits(session.user.id)

    return NextResponse.json({
      credits,
      userId: session.user.id
    })
  } catch (error) {
    console.error('Error fetching credits balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits balance' },
      { status: 500 }
    )
  }
}