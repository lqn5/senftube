import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { videoLikes, videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    const { newState, videoId } = await request.json();
    const id = Number(videoId);

    const userid = locals.user?.id;

    if(newState != "" && newState != "like" && newState != "dislike"){
        return new Response('Invalid new State', { status: 400 });
    }

    if (!userid) {
        return new Response('Unauthorized', { status: 401 });
    }

    if (Number.isNaN(id)) {
        return new Response('Invalid video id', { status: 404 });
    }

    await db
        .insert(videoLikes)
        .values({ type: newState, video: videoId, user: userid })
        .onConflictDoUpdate({
            target: [videoLikes.user, videoLikes.video],
            set: { type: newState }
        });

    return json({ ok: true, message: 'Video liked' }, { status: 201 });
}
