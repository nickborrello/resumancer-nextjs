import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CreditsService } from '@/services/creditsService'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get limit from query params (default 50)
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100

    // Get user credit history using CreditsService
    const history = await CreditsService.getCreditHistory(session.user.id, limit)

    return NextResponse.json({
      history,
      userId: session.user.id,
      limit
    })
  } catch (error) {
    console.error('Error fetching credits history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits history' },
      { status: 500 }
    )
  }
}