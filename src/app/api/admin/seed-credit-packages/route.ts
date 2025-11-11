import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CreditsService } from '@/services/creditsService'

export async function POST(_request: NextRequest) {
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

    // Seed credit packages using CreditsService
    await CreditsService.seedCreditPackages()

    // Get the seeded packages to return
    const packages = await CreditsService.getCreditPackages()

    return NextResponse.json({
      message: 'Credit packages seeded successfully',
      packages
    })
  } catch (error) {
    console.error('Error seeding credit packages:', error)
    return NextResponse.json(
      { error: 'Failed to seed credit packages' },
      { status: 500 }
    )
  }
}