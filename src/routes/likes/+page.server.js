import { redirect } from '@sveltejs/kit';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';
import { auth } from '$lib/server/auth';
import { user, videoLikes, videos } from '$lib/server/db/auth.schema';
import { db } from '$lib/server/db';
import { desc, eq, inArray } from 'drizzle-orm';

export const actions = {
	signOut: async (event) => {e
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};

export const load = async ({ event, locals }) => {
	if(!locals.user) return {};
	
	const userLikesRows = await db
		.select()
		.from(videoLikes)
		.where(eq(videoLikes.user, locals.user.id));

	const likedVideos = userLikesRows.filter(like => like.type == "like").map(like => like.video)

	const videoRows = await db
		.select({
			id: videos.id,
			title: videos.title,
			thumbnail: videos.thumbnail,
			views: videos.views,
			timestamp: videos.timestamp,
			videoFile: videos.videoFile,
			status: videos.status,
			image: user.image,
			atHandle: user.atHandle,
			verified: user.verified
		})
		.from(videos)
		.leftJoin(user, eq(videos.user, user.id))
		.orderBy(desc(videos.id))
		.where(inArray(videos.id, likedVideos))
		.limit(20);

	const videoData = (
		await Promise.all(
			videoRows.map(async(video) => {
				if (video.status !== "ready") {
					return null;
				}

				const response = await fetch(
					`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/stream/` + video.videoFile,
					{
						headers: {
							Authorization: `Bearer ${CLOUDFLARE_KEY}`
						}
					}
				);

				const data = await response.json();

				if (!data.result?.readyToStream) {
					return null;
				}

				const totalSeconds = Math.round(data.result.duration);
				const minutes = Math.floor(totalSeconds / 60);
				const seconds = totalSeconds % 60;
				const duration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;


				return { ...video, duration };
			})
		)
	).filter(Boolean);
	
	return { videoData };
};
