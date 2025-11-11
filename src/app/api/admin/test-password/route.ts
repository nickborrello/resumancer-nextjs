import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const testPassword = body.password || "testpassword";

    // In this Next.js version, we use OAuth-only authentication
    // Passwords are not stored in the database - authentication is handled by NextAuth.js
    // This endpoint exists for API compatibility but will indicate OAuth-only setup

    // Get user to check if they exist
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, "test@example.com"))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({
        password_tested: testPassword,
        auth_system: "OAuth-only (NextAuth.js)",
        password_hash_exists: false,
        comparison_result: "N/A - OAuth authentication",
        message: "This application uses OAuth-only authentication. Password testing is not applicable.",
      });
    }

    const userData = user[0]!;

    return NextResponse.json({
      password_tested: testPassword,
      auth_system: "OAuth-only (NextAuth.js)",
      password_hash_exists: false,
      comparison_result: "N/A - OAuth authentication",
      user_exists: true,
      user_email: userData.email,
      message: "This application uses OAuth-only authentication. Password testing is not applicable.",
    });
  } catch (error) {
    console.error("❌ Error in test-password endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to test password",
        details: error instanceof Error ? error.message : String(error),
        auth_system: "OAuth-only (NextAuth.js)",
        message: "This application uses OAuth-only authentication. Password testing is not applicable.",
      },
      { status: 500 }
    );
  }
}