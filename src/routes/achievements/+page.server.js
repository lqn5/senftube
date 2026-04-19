import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { subscriptions, collectedAchievements as collectedAchievementsTable, inventory as inventoryTable, comments, commentLikes, videos, } from '$lib/server/db/auth.schema';
import { achievementDefinitions, getAchievementProgress } from '$lib/server/achievements';

export const load = async ({ locals }) => {
    const userId = locals.user?.id;
    if (!userId) return { achievements: [] };

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

    const achievements = Object.values(achievementDefinitions).map((definition) =>
        getAchievementProgress(definition, stats, collected)
    );

    return { achievements };
};
