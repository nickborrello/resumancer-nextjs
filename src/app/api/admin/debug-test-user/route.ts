import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    // Get the full user record
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, "test@example.com"))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({
        exists: false,
        message: "Test user does not exist in database",
        auth_system: "OAuth-only (NextAuth.js)",
      });
    }

    const userData = user[0]!;

    return NextResponse.json({
      exists: true,
      auth_system: "OAuth-only (NextAuth.js)",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        credits: userData.credits,
        subscription_tier: userData.subscription_tier,
        api_usage_count: userData.api_usage_count,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login: userData.last_login,
        // Note: No password_hash in OAuth-only system
        password_hash_exists: false,
      },
    });
  } catch (error) {
    console.error("❌ Error debugging test user:", error);
    return NextResponse.json(
      {
        error: "Failed to debug test user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}