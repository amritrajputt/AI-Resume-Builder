import { db } from "../../db/client";
import { users } from "../../db/schema"
import { ApiError } from "../../common/errors/ApiError";
import { eq, or } from "drizzle-orm";
type RegisterDto = {
    clerkId: string;
    name: string;
    email: string;
};


export class AuthService {
    static async registerService({ clerkId, name, email }: RegisterDto) {
        // Check for existing user by clerkId OR email
        const [existing] = await db
            .select()
            .from(users)
            .where(or(eq(users.clerkId, clerkId), eq(users.email, email)));

        if (existing) {
            // Update existing user with current clerkId, name, and email
            const [updatedUser] = await db
                .update(users)
                .set({ clerkId, name, email, updatedAt: new Date() })
                .where(eq(users.id, existing.id))
                .returning();
            return updatedUser;
        }

        const [newUser] = await db
            .insert(users)
            .values({ clerkId, name, email })
            .returning();
        return newUser;
    }
}

