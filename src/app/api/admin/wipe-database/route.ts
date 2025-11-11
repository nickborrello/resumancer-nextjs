import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/database/db'
import * as schema from '@/database/schema'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Security check - only allow in development or with secret
  const isDev = process.env.NODE_ENV === "development";
  const headers = await request.headers;
  const hasSecret =
    headers.get("x-admin-secret") === process.env['ADMIN_SECRET'] ||
    (await request.json()).secret === "dev-test-secret";

  if (!isDev && !hasSecret) {
    return NextResponse.json(
      {
        error: "Not allowed",
        message:
          "This endpoint is only available in development or with admin secret",
      },
      { status: 403 }
    );
  }

  try {
    console.log("🧹 Starting database wipe...");

    // Delete in reverse order of dependencies to avoid foreign key conflicts
    const results: Record<string, any> = {};

    // Delete related data first
    results['apiUsage'] = await db.delete(schema.apiUsage);
    results['awards'] = await db.delete(schema.awards);
    results['certifications'] = await db.delete(schema.certifications);
    results['languages'] = await db.delete(schema.languages);
    results['volunteer'] = await db.delete(schema.volunteer);
    results['creditTransactions'] = await db.delete(schema.creditTransactions);
    results['resumes'] = await db.delete(schema.resumes);
    results['skills'] = await db.delete(schema.skills);
    results['projects'] = await db.delete(schema.projects);
    results['experiences'] = await db.delete(schema.experiences);
    results['education'] = await db.delete(schema.education);
    results['portfolioLinks'] = await db.delete(schema.portfolioLinks);
    results['profiles'] = await db.delete(schema.profiles);
    results['payments'] = await db.delete(schema.payments);
    results['passwordResetTokens'] = await db.delete(schema.passwordResetTokens);

    // Delete sessions and accounts
    results['sessions'] = await db.delete(schema.sessions);
    results['accounts'] = await db.delete(schema.accounts);
    results['verificationTokens'] = await db.delete(schema.verificationTokens);

    // Delete users last
    results['users'] = await db.delete(schema.users);

    console.log("🧹 Database wipe completed");

    return NextResponse.json({
      success: true,
      message: "Database wiped successfully! 🧹",
      deletedRecords: {
        users: results['users']?.rowCount || 0,
        profiles: results['profiles']?.rowCount || 0,
        education: results['education']?.rowCount || 0,
        experiences: results['experiences']?.rowCount || 0,
        projects: results['projects']?.rowCount || 0,
        skills: results['skills']?.rowCount || 0,
        resumes: results['resumes']?.rowCount || 0,
        apiUsage: results['apiUsage']?.rowCount || 0,
        creditTransactions: results['creditTransactions']?.rowCount || 0,
        payments: results['payments']?.rowCount || 0,
        awards: results['awards']?.rowCount || 0,
        certifications: results['certifications']?.rowCount || 0,
        languages: results['languages']?.rowCount || 0,
        volunteer: results['volunteer']?.rowCount || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error wiping database:", error);
    return NextResponse.json(
      {
        error: "Failed to wipe database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}