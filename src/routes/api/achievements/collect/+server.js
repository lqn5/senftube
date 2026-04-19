import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user, collectedAchievements as collectedAchievementsTable, subscriptions, inventory as inventoryTable, comments, commentLikes, videos } from "$lib/server/db/auth.schema";
import { eq, sql } from "drizzle-orm";
import { achievementDefinitions, getAchievementProgress } from '$lib/server/achievements';

export async function POST({ request, locals }) {
    const userId = locals.user?.id;
    const { achievement } = await request.json();

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const subsQuery = db.select().from(subscriptions).where(eq(subscriptions.channel, userId));
    const inventoryQuery = db.select().from(inventoryTable).where(eq(inventoryTable.user, userId));
    const collectedRowsQuery = db.select().from(collectedAchievementsTable).where(eq(collectedAchievementsTable.user, userId));
    const videoDataQuery = db.select().from(videos).where(eq(videos.user, userId));
    
    const [subs, inventory, collectedRows, videoData] = await Promise.all([subsQuery, inventoryQuery, collectedRowsQuery, videoDataQuery])

    let usercomments = await db.select().from(comments).where(eq(comments.user, userId)).leftJoin(commentLikes, eq(comments.id, commentLikes.comment))

    let maxcommentlikes = 0;
    const commentLikeCounts = {}

    for(let i = 0; i < usercomments.length; i++){
        const commentId = usercomments[i].comments.id;

        if(commentLikeCounts[commentId] == null){
            commentLikeCounts[commentId] = 0;
        }

        if (usercomments[i].commentlikes) {
            commentLikeCounts[commentId] += 1;
        }

        if (commentLikeCounts[commentId] > maxcommentlikes) {
            maxcommentlikes = commentLikeCounts[commentId];
        }
    }
    
    let userTotalViewsData = videoData.map((value) => value.views);
    let userTotalViews = 0;

    if(userTotalViewsData.length != 0){
        userTotalViews = userTotalViewsData.reduce((a, b)=>a+b);
    }

    const stats = {
        subs: subs.length,
        namecolors: inventory.length,
        maxcommentlikes,
        totalviews: userTotalViews
    };

    const collected = collectedRows.map((row) => row.achievement);
    
    if(!achievementDefinitions[achievement]){
        return json({ ok: false }, { status: 404 });
    }

    const progress = getAchievementProgress(achievementDefinitions[achievement], stats, collected)


    if(progress.collected || !progress.completed){
        return json({ ok: false }, { status: 403 });
    }

    //payout
    
    let message = "Belohnung eingesammelt";

    if(progress.reward.type == "coins"){
        await db
            .update(user)
            .set({ coins: sql`${user.coins} + ${progress.reward.value}` })
            .where(eq(user.id, userId));

        message = "Du erhälst " + progress.reward.value + " Bytes"; 
    }
    if(progress.reward.type == "namecolor"){
        await db
            .insert(inventoryTable)
            .values({ user: userId, item: progress.reward.value})
            .onConflictDoNothing();

        message = "Du hast die Namensfarbe " + progress.reward.value + " freigeschalten"; 
    }

    await db.insert(collectedAchievementsTable).values({ user: userId, achievement });

    return json({ ok: true, message }, { status: 200 });
}