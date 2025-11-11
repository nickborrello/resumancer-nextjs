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

    console.log("🌱 Running test user seeding via CLI...");

    // Run the seeding script as a child process
    const scriptPath = path.resolve(__dirname, "../../../../../scripts/test.js");
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

    return new Promise((resolve) => {
      seedingProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ CLI seeding completed successfully!");
          resolve(NextResponse.json({
            success: true,
            message: "Test user created successfully via CLI! 🎉",
            output: stdout,
            instructions:
              "Check the server logs for the seeded user credentials and details.",
          }));
        } else {
          console.error("❌ CLI seeding failed with code:", code);
          resolve(NextResponse.json({
            success: false,
            error: "CLI seeding failed",
            details: stderr || stdout,
          }, { status: 500 }));
        }
      });

      seedingProcess.on("error", (error) => {
        console.error("❌ Error running CLI seeding:", error);
        resolve(NextResponse.json({
          success: false,
          error: "Failed to start CLI seeding",
          details: error.message,
        }, { status: 500 }));
      });
    });
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