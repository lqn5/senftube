import { and, eq } from 'drizzle-orm';
import { inventory, user as userTable, streakRewards as streakRewardsTable } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';
import { getDiffDays } from '$lib/server/streak';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (!sessionUser) return { user: null };

    let additionalUserData = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, sessionUser.id));

	const diffDays = getDiffDays(additionalUserData[0].lastUploadedVideo);
    
    if(diffDays > 1){
        additionalUserData[0].streak = 0;
        await db.update(userTable).set({ streak: 0 }).where(eq(userTable.id, sessionUser.id))
    }

    const user = { ...sessionUser, ...additionalUserData[0] };
    
    let userCollectedStreakRewards = await db.select().from(streakRewardsTable).where(eq(streakRewardsTable.user, sessionUser.id))

    userCollectedStreakRewards = userCollectedStreakRewards.map(value => value.rewardDays)

    let showStreakAlert = diffDays > 0;
    
    const streakRewards = [
        { days: 3, collected: userCollectedStreakRewards.includes(3) },
        { days: 7, collected: userCollectedStreakRewards.includes(7) },
        { days: 10, collected: userCollectedStreakRewards.includes(10) },
        { days: 30, collected: userCollectedStreakRewards.includes(30) },
        { days: 50, collected: userCollectedStreakRewards.includes(50) },
        { days: 100, collected: userCollectedStreakRewards.includes(100) },
    ]

    return { user, streakRewards, showStreakAlert };
};