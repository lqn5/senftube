import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, videos } from '$lib/server/db/auth.schema';
import { v4 as uuidv4 } from 'uuid';
import { DISCORD_WEBHOOK_URL } from "$env/static/private";
import { eq, sql } from 'drizzle-orm';
import { getDiffDays, isToday, updateStreak } from '$lib/server/streak';

export async function POST({ request, locals }) {
	const { title, description } = await request.json();

	const userid = locals.user?.id;

	if (!userid) {
		return new Response('Unauthorized', { status: 401 });
	}
	
	if(title.length == 0 || title.length > 50 || description.length == 0 || description.length > 250){
		return new Response('Invalid Title or Description', { status: 400 })
	}

    const uploadToken = uuidv4();

	const video = await db
		.insert(videos)
		.values({ uploadToken, user: userid, title, description, status: 'pending', videoFile: 'pending' })
		.returning();

	const videoAuthor = await db.select().from(user).where(eq(user.id, userid));

	const diffDays = getDiffDays(videoAuthor[0].lastUploadedVideo);

	await updateStreak(diffDays, userid);
	
	let firstVideoOfDay = !isToday(videoAuthor[0].lastUploadedVideo)

	if(firstVideoOfDay){
		await db
			.update(user)
			.set({ coins: sql`${user.coins} + 100` })
			.where(eq(user.id, userid));
	}

	await db.update(user).set({ lastUploadedVideo: new Date() }).where(eq(user.id, userid))

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'SenfTube Alerts',
            embeds: [{
                author: { name: 'Senftube' },
                title: `${videoAuthor[0].name} hat ein Video Hochgeladen!`,
                color: 0xff0000
            }]
        })
    })

	return json({ ok: true, message: 'Video erstellt' + (firstVideoOfDay ? ` - du erhältst ${100 + videoAuthor[0].streak * 3} Bytes` : ""), uploadToken, video: video[0] }, { status: 201 });
}
