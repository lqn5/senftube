import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subscriptions, videoLikes, videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
    const { channel } = await request.json();

    const userid = locals.user?.id;

    if (!userid || userid == channel) {
        return new Response('Unauthorized', { status: 401 });
    }

    const wasSubscribed = await db.select().from(subscriptions).where(and(eq(subscriptions.channel, channel ), eq(subscriptions.user, userid)));

    if(wasSubscribed.length != 0){
        await db.delete(subscriptions).where(
            and(
                eq(subscriptions.channel, channel),
                eq(subscriptions.user, userid)
            )
        );
    }
    else{
        await db
            .insert(subscriptions)
            .values({ channel: channel, user: userid });
    }
    return json({ ok: true, message: 'Subscription toggled' }, { status: 201 });
}
