import { and, desc, eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { commentLikes, comments, subscriptions, user, videoLikes, videos } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';

export async function load({ params, locals }) {
	const start = performance.now();

    const userId = locals?.user.id;

    if(!userId){
        throw error(400, 'Not logged in');
    }

    const id = Number(params.id);

    if (Number.isNaN(id)) {
        throw error(400, 'Not a number');
    }

    await db
        .update(videos)
        .set({ views: sql`${videos.views} + 1` })
        .where(eq(videos.id, id));

    const videoData = await db.select().from(videos).where(eq(videos.id, id));

    let video = videoData[0];

    if (!video) {
        throw error(404, 'Not found');
    }

    const author = video.user;

    const additionalVideoDataQuery = db.select({ name: user.name, image: user.image, verified: user.verified, atHandle: user.atHandle, nameColor: user.nameColor, userId: user.id }).from(user).where(eq(user.id, author));
    const userLikeDataQuery = db.select({ type: videoLikes.type }).from(videoLikes).where(and(eq(videoLikes.user, userId), eq(videoLikes.video, id)));
    const userSubscribedDataQuery = db.select().from(subscriptions).where(and(eq(subscriptions.user, userId), eq(subscriptions.channel, author)));      
    const videoLikeDataQuery = db.select().from(videoLikes).where(eq(videoLikes.video, id));
    const authorSubscriberDataQuery = db.select().from(subscriptions).where(eq(subscriptions.channel, author ));
    const viewerQuery = db.select({ verified: user.verified, nameColor: user.nameColor, id: user.id, coins: user.coins }).from(user).where(eq(user.id, userId ));

    const [ additionalVideoData, userLikeData, userSubscribedData, videoLikeData, authorSubscriberData, viewerData ] = await Promise.all([additionalVideoDataQuery, userLikeDataQuery, userSubscribedDataQuery, videoLikeDataQuery, authorSubscriberDataQuery, viewerQuery])

    const userLike = userLikeData[0] ?? { type: "" };
    
    let likes = 0;
    let dislikes = 0;

    for(let i = 0; i < videoLikeData.length; i ++){
        if(videoLikeData[i].type == "like"){
            likes++;
        }
        if(videoLikeData[i].type == "dislike"){
            dislikes++;
        }
    }

    let subscribers = 0;

    for(let i = 0; i < authorSubscriberData.length; i ++){
        subscribers++;
    }

    if (video.status !== 'ready') {
        throw error(404, 'Not found');
    }

    let commentData = await db.select(
            {
                id: comments.id,
                content: comments.content,
                timestamp: comments.timestamp,
                pinned: comments.pinned,
                donation: comments.donation,
                atHandle: user.atHandle,
                name: user.name,
                userImage: user.image,
                userId: user.id,
                nameColor: user.nameColor,
                verified: user.verified,
            }
        )
        .from(comments)
        .where(eq(comments.video, id))
        .leftJoin(user, eq(user.id, comments.user))
        .orderBy(desc(comments.pinned), desc(comments.timestamp));

    for(let i = 0; i < commentData.length; i++){
        let totalCommentLikes = 0;

        const [commentLikeData, userCommentLikeData] = await Promise.all([
            db.select().from(commentLikes).where(eq(commentLikes.comment, commentData[i].id)),
            db.select().from(commentLikes).where(and(eq(commentLikes.user, userId), eq(commentLikes.comment, commentData[i].id)))
        ])

        totalCommentLikes = commentLikeData.length;

        commentData[i] = {...commentData[i], userCommentLikeData, totalCommentLikes}
    }

    video = {...video, ...additionalVideoData[0], ...userLike, likes, dislikes, subscribers, subdata: userSubscribedData[0], commentData, viewerData: viewerData[0]}
    return { video };
};
