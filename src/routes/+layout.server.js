import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { 
    subscriptions, 
    collectedAchievements as collectedAchievementsTable, 
    inventory as inventoryTable, 
    comments, 
    commentLikes, 
    videos,
    streakRewards as streakRewardsTable, 
    user
} from '$lib/server/db/auth.schema';
import { achievementDefinitions, getAchievementProgress } from '$lib/server/achievements';

const allowedPathsNotLoggedIn = ["/login", "/reset-password"];

export const load = async (event) => {
    const { locals, url } = event;

    if (!locals.user) {
        if (!allowedPathsNotLoggedIn.includes(url.pathname)) {
            throw redirect(302, '/login');
        }
        return { user: null };
    }

    const userId = locals.user.id;

    const [subs, inventory, collectedRows, videoData] = await Promise.all([
        db.select().from(subscriptions).where(eq(subscriptions.channel, userId)),
        db.select().from(inventoryTable).where(eq(inventoryTable.user, userId)),
        db.select().from(collectedAchievementsTable).where(eq(collectedAchievementsTable.user, userId)),
        db.select().from(videos).where(eq(videos.user, userId))
    ]);

    const usercomments = await db.select()
        .from(comments)
        .where(eq(comments.user, userId))
        .leftJoin(commentLikes, eq(comments.id, commentLikes.comment));

    let maxcommentlikes = 0;
    const commentLikeCounts = {};

    for (const row of usercomments) {
        const commentId = row.comments.id;
        if (!commentLikeCounts[commentId]) {
            commentLikeCounts[commentId] = 0;
        }
        if (row.commentlikes) {
            commentLikeCounts[commentId] += 1;
        }
        if (commentLikeCounts[commentId] > maxcommentlikes) {
            maxcommentlikes = commentLikeCounts[commentId];
        }
    }

    const userTotalViews = videoData.reduce((acc, video) => acc + (video.views || 0), 0);

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

    let collectableAchievements = 0;
    for (const achievement of achievements) {
        if (achievement.completed && !achievement.collected) {
            collectableAchievements++;
        }
    }

    // STREAK REWARDS
    let additionalUserData = await db
        .select()
        .from(user)
        .where(eq(user.id, userId));

    let userCollectedStreakRewards = await db.select().from(streakRewardsTable).where(eq(streakRewardsTable.user, userId))

    userCollectedStreakRewards = userCollectedStreakRewards.map(value => value.rewardDays)
    
    const streakRewards = [
        { days: 3, collected: userCollectedStreakRewards.includes(3) },
        { days: 7, collected: userCollectedStreakRewards.includes(7) },
        { days: 10, collected: userCollectedStreakRewards.includes(10) },
        { days: 30, collected: userCollectedStreakRewards.includes(30) },
        { days: 50, collected: userCollectedStreakRewards.includes(50) },
        { days: 100, collected: userCollectedStreakRewards.includes(100) },
    ]

    let collectableStreakRewards = 0;

    for(const reward of streakRewards){
        if(!reward.collected && additionalUserData[0].maxStreak >= reward.days){
            collectableStreakRewards++;
        }   
    }

    return { 
        user: locals.user, 
        collectableAchievements,
        collectableStreakRewards
    };
};