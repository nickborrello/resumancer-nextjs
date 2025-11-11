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

    // TODO: Add proper admin role checking
    // For now, allowing any authenticated user (should be restricted to admins)

    // Get credit statistics using CreditsService
    const stats = await CreditsService.getCreditStats()

    return NextResponse.json({
      stats
    })
  } catch (error) {
    console.error('Error getting credit stats:', error)
    return NextResponse.json(
      { error: 'Failed to get credit statistics' },
      { status: 500 }
    )
  }
}