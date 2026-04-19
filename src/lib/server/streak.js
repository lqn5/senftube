import { eq } from "drizzle-orm";
import { db } from "./db";
import { user } from "./db/auth.schema";

export const streakRewards = {
    3: { type: "coins", value: 300 },
    7: { type: "namecolor", value: "neo" },
    10: { type: "coins", value: 500 },
    30: { type: "namecolor", value: "astra" },
    50: { type: "coins", value: 1000 },
    100: { type: "coins", value: 5000 },
}

export function getDiffDays(lastUploadedVideo){
    const now = new Date();
	const last = new Date(lastUploadedVideo);

    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastDay = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    
    return Math.round((today - lastDay) / (1000 * 60 * 60 * 24));
}

export async function updateStreak(diffDays, userId){
    if(diffDays == 1){
        const streakData = await db.select({ maxStreak: user.maxStreak, streak: user.streak }).from(user).where(eq(user.id, userId));

		const currentStreak = streakData[0].streak;
		const updatedStreak = currentStreak + 1;

        await db.update(user).set({ streak: updatedStreak }).where(eq(user.id, userId));
    
        if (updatedStreak > streakData[0].maxStreak) {
            await db.update(user).set({ maxStreak: updatedStreak }).where(eq(user.id, userId));
        }
    }
    else if(diffDays > 1){
        const streakData = await db.select().from(user).where(eq(user.id, userId))

        await db.update(user).set({ streak: 1 }).where(eq(user.id, userId))
        
        if (1 > streakData[0].maxStreak) {
            await db.update(user).set({ maxStreak: 1 }).where(eq(user.id, userId));
        }
    }
}

export function isToday(date) {
    if(date == null){
        return false;
    }
    const today = new Date();
    return (
        date.getUTCFullYear() === today.getUTCFullYear() &&
        date.getUTCMonth() === today.getUTCMonth() &&
        date.getUTCDate() === today.getUTCDate()
    );
}
