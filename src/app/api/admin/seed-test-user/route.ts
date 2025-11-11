import { NextRequest, NextResponse } from 'next/server'
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export const runtime = 'nodejs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function POST(request: NextRequest) {
  try {
    // Basic security - only allow in development or with secret
    const isDev = process.env.NODE_ENV === "development";
    const headers = await request.headers;
    const body = await request.json().catch(() => ({}));
    const hasSecret =
      headers.get("x-admin-secret") === process.env['ADMIN_SECRET'] ||
      body.secret === "dev-test-secret";

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

    console.log("🌱 Running test user seeding via CLI...");

    // Run the seeding script as a child process
    const scriptPath = path.resolve(__dirname, "../../../../../scripts/test.js");

    // Use a Promise to handle the child process
    const seedingResult = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve) => {
      const seedingProcess = spawn("node", [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: path.resolve(__dirname, "../../../../../"),
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
        message: "Test user created successfully via CLI! 🎉",
        output: seedingResult.output,
        instructions:
          "Check the server logs for the seeded user credentials and details.",
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "CLI seeding failed",
        details: seedingResult.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error creating test user via HTTP:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}