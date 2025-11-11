import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import {
  users,
  profiles,
  education,
  experiences,
  projects,
  skills,
} from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    // Check if user exists
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

    const userId = user[0]!.id;

    // Check profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    // Count related data
    const [educationCount, experienceCount, projectCount, skillCount] =
      await Promise.all([
        db
          .select()
          .from(education)
          .where(eq(education.profileId, profile[0]?.id || "none")),
        db
          .select()
          .from(experiences)
          .where(eq(experiences.profileId, profile[0]?.id || "none")),
        db
          .select()
          .from(projects)
          .where(eq(projects.profileId, profile[0]?.id || "none")),
        db
          .select()
          .from(skills)
          .where(eq(skills.profileId, profile[0]?.id || "none")),
      ]);

    return NextResponse.json({
      exists: true,
      auth_system: "OAuth-only (NextAuth.js)",
      user: {
        id: user[0]!.id,
        email: user[0]!.email,
        name: user[0]!.name,
        credits: user[0]!.credits,
        subscription_tier: user[0]!.subscription_tier,
        created_at: user[0]!.created_at,
      },
      profile: profile[0] || null,
      counts: {
        education: educationCount.length,
        experience: experienceCount.length,
        projects: projectCount.length,
        skills: skillCount.length,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying test user:", error);
    return NextResponse.json(
      {
        error: "Failed to verify test user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}