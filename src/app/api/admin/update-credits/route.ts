import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development or with secret
    const isDev = process.env.NODE_ENV === "development";
    const body = await request.json().catch(() => ({}));
    const hasSecret =
      request.headers.get("x-admin-secret") === process.env['ADMIN_SECRET'] ||
      body.secret === "dev-test-secret";

    if (!isDev && !hasSecret) {
      return NextResponse.json(
        {
          error: "Not allowed",
          message: "This endpoint is only available in development or with admin secret",
        },
        { status: 403 }
      );
    }

    const { email = "test@example.com", credits = 100 } = body;

    console.log(`🎯 Updating credits for ${email} to ${credits}...`);

    // Update the user's credits
    const result = await db
      .update(users)
      .set({
        credits: parseInt(credits.toString()),
        updated_at: new Date(),
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      console.log(`✅ Credits updated successfully for ${email}`);
      return NextResponse.json({
        success: true,
        message: `Credits updated successfully! 💰`,
        user: {
          email: result[0]!.email,
          credits: result[0]!.credits,
          userId: result[0]!.id,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: `No user found with email: ${email}`,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Error updating credits:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update credits",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}