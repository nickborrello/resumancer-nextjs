import { db } from "@/database/db";
import {
  users,
  creditTransactions,
  creditPackages,
} from "@/database/schema";
import { eq, desc, sum } from "drizzle-orm";

export class CreditsService {
  // Get user's current credit balance
  static async getUserCredits(userId: string): Promise<number> {
    try {
      console.log("🔍 Getting credits for user:", userId);

      const [user] = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      console.log("📊 Query result:", user);
      console.log("💳 Credits value:", user?.credits);

      const creditsValue = user?.credits || 0;
      console.log("✅ Returning credits:", creditsValue);

      return creditsValue;
    } catch (error) {
      console.error("❌ Error getting user credits:", error);
      throw new Error("Failed to get credit balance");
    }
  }

  // Check if user has enough credits for an operation
  static async hasEnoughCredits(userId: string, requiredCredits = 1): Promise<boolean> {
    const currentCredits = await this.getUserCredits(userId);
    return currentCredits >= requiredCredits;
  }

  // Deduct credits from user account (for resume generation)
  static async deductCredits(
    userId: string,
    amount = 1,
    description = "Resume generation",
    resumeId: string | null = null
  ): Promise<number> {
    try {
      // Start transaction-like operation
      const currentCredits = await this.getUserCredits(userId);

      if (currentCredits < amount) {
        throw new Error("Insufficient credits");
      }

      // Update user credits
      await db
        .update(users)
        .set({
          credits: currentCredits - amount,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId));

      // Record transaction
      await db.insert(creditTransactions).values({
        userId: userId,
        type: "usage",
        amount: -amount,
        description,
        resumeId: resumeId,
      });

      return currentCredits - amount; // Return new balance
    } catch (error) {
      console.error("Error deducting credits:", error);
      throw error;
    }
  }

  // Add credits to user account (for purchases or bonuses)
  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    paymentId: string | null = null
  ): Promise<number> {
    try {
      const currentCredits = await this.getUserCredits(userId);

      // Update user credits
      await db
        .update(users)
        .set({
          credits: currentCredits + amount,
          updated_at: new Date(),
        })
        .where(eq(users.id, userId));

      // Record transaction
      await db.insert(creditTransactions).values({
        userId: userId,
        type: paymentId ? "purchase" : "bonus",
        amount: amount,
        description,
        paymentId: paymentId,
      });

      return currentCredits + amount; // Return new balance
    } catch (error) {
      console.error("Error adding credits:", error);
      throw error;
    }
  }

  // Get user's credit transaction history
  static async getCreditHistory(userId: string, limit = 50) {
    try {
      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit);

      return transactions;
    } catch (error) {
      console.error("Error getting credit history:", error);
      throw new Error("Failed to get credit history");
    }
  }

  // Get available credit packages
  static async getCreditPackages() {
    try {
      const packages = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.isActive, 1))
        .orderBy(creditPackages.sortOrder);

      return packages;
    } catch (error) {
      console.error("Error getting credit packages:", error);
      throw new Error("Failed to get credit packages");
    }
  }

  // Seed initial credit packages
  static async seedCreditPackages() {
    try {
      // Check if table exists and has data
      let existingPackages = [];
      try {
        existingPackages = await this.getCreditPackages();
      } catch (error) {
        // Table might not exist yet, continue with seeding
        console.log("Credit packages table not ready yet, will seed...");
      }

      if (existingPackages.length > 0) {
        console.log("✅ Credit packages already exist, skipping seed");
        return; // Already seeded
      }

      const packages = [
        {
          name: "Starter Pack",
          credits: 10,
          price: 999, // $9.99
          sortOrder: 1,
        },
        {
          name: "Pro Pack",
          credits: 25,
          price: 1999, // $19.99 (20% discount)
          sortOrder: 2,
        },
        {
          name: "Premium Pack",
          credits: 50,
          price: 3499, // $34.99 (30% discount)
          sortOrder: 3,
        },
        {
          name: "Ultimate Pack",
          credits: 100,
          price: 5999, // $59.99 (40% discount)
          sortOrder: 4,
        },
      ];

      await db.insert(creditPackages).values(packages);

      console.log("✅ Credit packages seeded successfully");
    } catch (error) {
      console.error("Error seeding credit packages:", error);
      // Don't throw error to prevent startup failure
    }
  }

  // Get credit statistics for admin/analytics
  static async getCreditStats() {
    try {
      // Total credits purchased
      const [totalPurchased] = await db
        .select({
          total: sum(creditTransactions.amount),
        })
        .from(creditTransactions)
        .where(eq(creditTransactions.type, "purchase"));

      // Total credits used
      const [totalUsed] = await db
        .select({
          total: sum(creditTransactions.amount),
        })
        .from(creditTransactions)
        .where(eq(creditTransactions.type, "usage"));

      const purchasedTotal = Number(totalPurchased?.total) || 0;
      const usedTotal = Number(totalUsed?.total) || 0;

      return {
        totalPurchased: purchasedTotal,
        totalUsed: Math.abs(usedTotal), // Make positive for display
        netCredits: purchasedTotal + usedTotal,
      };
    } catch (error) {
      console.error("Error getting credit stats:", error);
      throw new Error("Failed to get credit statistics");
    }
  }
}