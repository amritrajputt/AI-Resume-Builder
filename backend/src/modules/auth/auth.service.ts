import { db } from "../../db/client";
import { users } from "../../db/schema"
import { ApiError } from "../../common/errors/ApiError";
import { eq } from "drizzle-orm";
type RegisterDto = {
    clerkId: string;
    name: string;
    email: string;
};


export class AuthService {
    static async registerService({ clerkId, name, email }: RegisterDto) {
        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId));

        if (existing) {
            const [updatedUser] = await db
                .update(users)
                .set({ name, email, updatedAt: new Date() })
                .where(eq(users.clerkId, clerkId))
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

