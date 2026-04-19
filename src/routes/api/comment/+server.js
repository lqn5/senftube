import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { comments, subscriptions, user, videoLikes, videos } from '$lib/server/db/auth.schema';
import { and, eq, sql } from 'drizzle-orm';

export async function POST({ request, locals }) {
    const { video, comment, donation = 0 } = await request.json();

    const userid = locals.user?.id;

    if (!userid || comment.length == 0 || comment.length > 150) {
        return new Response('Unauthorized', { status: 401 });
    }

    const videoData = await db.select({
        user: videos.user
    }).from(videos).where(eq(videos.id, video));
    
    if (videoData.length === 0) {
        return new Response('Video nicht gefunden', { status: 404 });
    }
    
    if(donation > 0 && userid == videoData[0].user){
        return new Response('Unauthorized', { status: 401 });
    }

    const commentAuthor = await db.select().from(user).where(eq(user.id, userid));

    if(commentAuthor[0].coins < donation){
        return new Response('Unauthorized', { status: 401 });
    }

    await db
        .insert(comments)
        .values({ video, user: userid, content: comment, donation });

    let firstCommentOfDay = !isToday(commentAuthor[0].lastCommented)

    if(firstCommentOfDay){
        await db
            .update(user)
            .set({ coins: sql`${user.coins} + ${50 + commentAuthor[0].streak * 3}` })
            .where(eq(user.id, userid));
    }

    await db.update(user).set({ lastCommented: new Date() }).where(eq(user.id, userid))

    if(validDonationValues.includes(donation)){
        await db.transaction(async (tx) => {
            await tx.update(user).set({ coins: sql`${user.coins} - ${donation}` }).where(eq(user.id, userid));
            await tx.update(user).set({ coins: sql`${user.coins} + ${donation}` }).where(eq(user.id, videoData[0].user));
        });
    }

    return json({ ok: true, message: 'Kommentar hinzugefügt' + (firstCommentOfDay ? ` - du erhältst ${50 + commentAuthor[0].streak * 3} Bytes` : "") }, { status: 201 });
}

export async function DELETE({ request, locals }) {
    const { id } = await request.json();

    const userid = locals.user?.id;

    if (!userid) {
        return new Response('Unauthorized', { status: 401 });
    }

    const permissionCheck = await db
        .select()
        .from(comments)
        .where(and(eq(comments.id, id), eq(comments.user, userid)));

    if (permissionCheck.length === 0 && locals.user.role != "admin") {
        return new Response('Unauthorized', { status: 401 });
    }

    await db
        .delete(comments)
        .where(eq(comments.id, id));

    return json({ ok: true, message: 'Kommentar gelöscht' }, { status: 200 });
}

function isToday(date) {
    if(date == null){
        return false;
    }
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

const validDonationValues = [100, 250, 500];