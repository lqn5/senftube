import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { videos } from '$lib/server/db/auth.schema';
import { and, eq } from 'drizzle-orm';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';

export async function POST({ request, locals }) {
	const { videoId, newTitle, newDescription } = await request.json();
	const id = Number(videoId);
	const userid = locals.user?.id;

	if (!userid) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (Number.isNaN(id)) {
		return new Response('Invalid video id', { status: 400 });
	}

	if(newTitle.length == 0 || newTitle.length > 30 || newDescription.length == 0 || newDescription.length > 150){
		return new Response('Invalid Title or Description', { status: 400 })
	}

	const permissionCheck = await db
		.select()
		.from(videos)
		.where(and(eq(videos.user, userid), eq(videos.id, id)));

	if (permissionCheck.length === 0 && locals.user.role != "admin") {
		return new Response('Unauthorized', { status: 401 });
	}
	
	await db
		.update(videos)
		.set({ title: newTitle, description: newDescription })
		.where(eq(videos.id, id));

	return json({ ok: true, message: 'Video bearbeitet' }, { status: 201 });
}
