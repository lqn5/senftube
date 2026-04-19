import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pinnedVideos, videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';

export async function POST({ request, locals }) {
    const { video } = await request.json();
    const id = Number(video);

    if (locals?.user?.role != "admin") {
        return new Response('Unauthorized', { status: 401 });
    }

    if (Number.isNaN(id)) {
        return new Response('Invalid video id', { status: 400 });
    }
    
    await db.delete(pinnedVideos);

    await db.insert(pinnedVideos).values({ id, pinned: true})

    return json({ ok: true, message: 'Video bearbeitet' }, { status: 201 });
}
