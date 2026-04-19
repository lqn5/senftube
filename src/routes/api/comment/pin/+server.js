import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { comments, videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    const { comment } = await request.json();

    const userid = locals.user?.id;

    if(isNaN(comment) || !userid){
        return json({ ok: false, message: "Unauthorized"}, { status: 401 })
    }

    const commentData = await db.select().from(comments).where(eq(comments.id, comment));

    if(commentData.length == 0){
        return json({ ok: false, message: "Comment not found"}, { status: 404 })
    }

    const commentVideoAuth = await db.select().from(videos).where(and(eq(videos.id, commentData[0].video), eq(videos.user, userid)));

    if(commentVideoAuth.length == 0){
       return json({ ok: false, message: "Forbidden"}, { status: 403 }) 
    }
    
    await db.update(comments).set({ pinned: !commentData[0].pinned }).where(eq(comments.id, comment))
    
    return json({ ok: true, message: 'Comment pin toggled' }, { status: 200 });
}