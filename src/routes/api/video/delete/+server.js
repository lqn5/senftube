import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';

export async function POST({ request, locals }) {
	const { videoId } = await request.json();
	const id = Number(videoId);

	const userid = locals.user?.id;

	if (!userid) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (Number.isNaN(id)) {
		return new Response('Invalid video id', { status: 400 });
	}

	const permissionCheck = await db
		.select()
		.from(videos)
		.where(and(eq(videos.user, userid), eq(videos.id, id)));

	if (permissionCheck.length === 0 && locals.user.role != "admin") {
		return new Response('Unauthorized', { status: 401 });
	}

	const mediaID = await db.select().from(videos).where(eq(videos.id, id));

	const authHeaders = {
		Authorization: `Bearer ${CLOUDFLARE_KEY}`
	};

	await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/stream/${mediaID[0].videoFile}`,
		{ method: 'DELETE', headers: authHeaders }
	);

    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/images/v1/${mediaID[0].thumbnail}`,
      { method: 'DELETE', headers: authHeaders }
    );

	await db
		.delete(videos)
		.where(eq(videos.id, id));

	return json({ ok: true, message: 'Video gelöscht' }, { status: 201 });
}
