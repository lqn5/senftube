import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { inventory, user, streakRewards as streakRewardsTable } from "$lib/server/db/auth.schema";
import { eq, sql } from "drizzle-orm";
import { streakRewards } from "$lib/server/streak";

export async function POST({ request, locals }) {
    const userId = locals.user?.id;
    const { days } = await request.json();

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userMaxStreak = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if(userMaxStreak[0].maxStreak < days){ 
        return json({ ok: false }, { status: 403 });
    }

    let userCollectedStreakRewards = await db.select().from(streakRewardsTable).where(eq(streakRewardsTable.user, userId))

    userCollectedStreakRewards = userCollectedStreakRewards.map(value => value.rewardDays)

    if(userCollectedStreakRewards.includes(days)){
        return json({ ok: false }, { status: 403 });
    }

    if(!streakRewards[days]){
        return json({ ok: false }, { status: 403 });
    }

    let message = "";

    if(streakRewards[days].type == "coins"){
        await db
            .update(user)
            .set({ coins: sql`${user.coins} + ${streakRewards[days].value}` })
            .where(eq(user.id, userId));

        message = "Du erhälst " + streakRewards[days].value + " Bytes"; 
    }
    if(streakRewards[days].type == "namecolor"){
        await db
            .insert(inventory)
            .values({ user: userId, item: streakRewards[days].value})
            .onConflictDoNothing();
            
        message = "Du hast die Namensfarbe " + streakRewards[days].value + " freigeschalten!";
    }

    await db.insert(streakRewardsTable).values({ user: userId, rewardDays: days })

    return json({ ok: true, message }, { status: 200 });
}