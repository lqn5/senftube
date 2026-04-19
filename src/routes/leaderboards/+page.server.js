import { and, count, desc, eq, gte, sql, sum } from 'drizzle-orm';
import { inventory, user as userTable, streakRewards as streakRewardsTable, user, videos, subscriptions, videoLikes } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (!sessionUser) return { user: null };

    const viewsQuery = await db
        .select({
            atHandle: user.atHandle,
            name: user.name,
            nameColor: user.nameColor,
            image: user.image,
            totalViews: sum(videos.views).mapWith(Number), 
        })
        .from(user)
        .innerJoin(videos, eq(user.id, videos.user))
        .groupBy(user.id)
        .orderBy((t) => desc(t.totalViews))
        .limit(10);

    const subsQuery = await db
        .select({
            atHandle: user.atHandle,
            name: user.name,
            nameColor: user.nameColor,
            image: user.image,
            subs: count(subscriptions.user).mapWith(Number)
        })
        .from(user)
        .innerJoin(subscriptions, eq(user.id, subscriptions.channel))
        .groupBy(user.id)
        .orderBy((t) => desc(t.subs))
        .limit(10);
    
    const coinsQuery = await db
        .select({
            atHandle: user.atHandle,
            name: user.name,
            nameColor: user.nameColor,
            image: user.image,
            coins: user.coins
        })
        .from(user)
        .orderBy(desc(user.coins))
        .limit(10)

    const likesQuery = await db
        .select({
            atHandle: user.atHandle,
            name: user.name,
            nameColor: user.nameColor,
            image: user.image,
            likes: count(videoLikes.video).mapWith(Number)
        })
        .from(user)
        .innerJoin(videos, eq(user.id, videos.user))
        .innerJoin(videoLikes, eq(videos.id, videoLikes.video))
        .groupBy(user.id)
        .orderBy((t) => desc(t.likes))
        .limit(10);

    const streakQuery = db
        .select({
            atHandle: user.atHandle,
            name: user.name,
            nameColor: user.nameColor,
            image: user.image,
            streak: user.streak,
        })
        .from(user)
        .where(
            gte(user.lastUploadedVideo, sql`NOW() - INTERVAL '2 days'`)
        )
        .orderBy(desc(user.streak))
        .limit(10);
        
    const [viewsResult, subsResult, coinsResult, likesResult, streakResult] = await Promise.all([viewsQuery, subsQuery, coinsQuery, likesQuery, streakQuery]);
    
    return { viewsResult, subsResult, coinsResult, likesResult, streakResult };
};