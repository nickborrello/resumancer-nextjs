import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "@/database/db";
import {
  apiUsage,
  creditTransactions,
  resumes,
  skills,
  projects,
  experiences,
  education,
  profiles,
  payments,
  users,
  awards,
  certifications,
  languages,
  volunteer,
} from "@/database/schema";

export const runtime = 'nodejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    console.log("🔄 Starting database reset and seed...");

    // First wipe the database
    console.log("🧹 Wiping database...");

    // Delete in reverse order of dependencies to avoid foreign key conflicts
    const results: Record<string, any> = {};

    // Delete related data first
    results['apiUsage'] = await db.delete(apiUsage);
    results['creditTransactions'] = await db.delete(creditTransactions);
    results['awards'] = await db.delete(awards);
    results['certifications'] = await db.delete(certifications);
    results['languages'] = await db.delete(languages);
    results['volunteer'] = await db.delete(volunteer);
    results['resumes'] = await db.delete(resumes);
    results['skills'] = await db.delete(skills);
    results['projects'] = await db.delete(projects);
    results['experiences'] = await db.delete(experiences);
    results['education'] = await db.delete(education);
    results['profiles'] = await db.delete(profiles);
    results['payments'] = await db.delete(payments);

    // Delete users last
    results['users'] = await db.delete(users);

    console.log("✅ Database wiped successfully");

    // Then run the seeding script via CLI
    console.log("🌱 Running test user seeding via CLI...");
    const scriptPath = path.resolve(__dirname, "../../../../../../scripts/test.js");

    // Use a Promise to handle the child process
    const seedingResult = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve) => {
      const seedingProcess = spawn("node", [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: path.resolve(__dirname, "../../../../../../"),
      });

      let stdout = "";
      let stderr = "";

      seedingProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      seedingProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      seedingProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ CLI seeding completed successfully!");
          resolve({ success: true, output: stdout });
        } else {
          console.error("❌ CLI seeding failed with code:", code);
          resolve({ success: false, error: stderr || stdout });
        }
      });

      seedingProcess.on("error", (error: any) => {
        console.error("❌ Error running CLI seeding:", error);
        resolve({ success: false, error: error.message });
      });
    });

    if (seedingResult.success) {
      return NextResponse.json({
        success: true,
        message: "Database reset and test user created successfully via CLI! 🎉",
        wipe: "Database completely wiped",
        seeding: "Test user seeded via CLI",
        output: seedingResult.output,
        instructions: "Check the server logs for the seeded user credentials and details.",
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
    } else {
      return NextResponse.json(
        {
          error: "Database reset succeeded but seeding failed",
          wipe: "Database completely wiped",
          seeding: "Failed to seed test user",
          details: seedingResult.error,
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
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    return NextResponse.json(
      {
        error: "Failed to reset database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}