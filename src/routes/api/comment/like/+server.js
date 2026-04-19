import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { commentLikes, comments, subscriptions, videoLikes, videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    const { id } = await request.json();

    const userid = locals.user?.id;
    if(isNaN(id) || !userid){
        return json({ ok: false, message: "Unauthorized"}, { status: 401 })
    }

    const existing = await db
        .select()
        .from(commentLikes)
        .where(and(eq(commentLikes.user, userid), eq(commentLikes.comment, id)));

    if (existing.length > 0) {
        await db.delete(commentLikes)
            .where(and(eq(commentLikes.user, userid), eq(commentLikes.comment, id)));
    } else {
        await db.insert(commentLikes)
            .values({ user: userid, comment: id });
    }
    
    return json({ ok: true, message: 'Comment like toggled' }, { status: 201 });
}