import { db } from "../../index"
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
        const [user] = await db
            .insert(users)
            .values({ clerkId, name, email })
            .onConflictDoUpdate({
                target: users.clerkId,
                set: { name, email, updatedAt: new Date() },
            })
            .returning();
        return user;
    }
}

