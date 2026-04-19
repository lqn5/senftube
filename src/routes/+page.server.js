import { redirect } from '@sveltejs/kit';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';
import { auth } from '$lib/server/auth';
import { pinnedVideos, user, videos } from '$lib/server/db/auth.schema';
import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';

export const actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};

export const load = async (event) => {
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
	
	const pinnedId = await db
		.select({
			id: pinnedVideos.id
		})
		.from(pinnedVideos)
		.where(eq(pinnedVideos.pinned, true))

	if(!pinnedId[0]){
		return { videoData }
	}

	// pinned video
	const pinnedRows = await db
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
		.where(eq(videos.id, pinnedId[0].id))

	let pinnedVideo = pinnedRows[0];

	if(pinnedVideo){
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/stream/` + pinnedVideo.videoFile,
			{
				headers: {
					Authorization: `Bearer ${CLOUDFLARE_KEY}`
				}
			}
		);

		const data = await response.json();

		const ptotalSeconds = Math.round(data.result.duration);
		const pminutes = Math.floor(ptotalSeconds / 60);
		const pseconds = ptotalSeconds % 60;
		const pduration = `${String(pminutes).padStart(2, '0')}:${String(pseconds).padStart(2, '0')}`;

		pinnedVideo = {...pinnedVideo, duration: pduration}

		return { videoData, pinnedVideo: pinnedVideo };
	}
	return { videoData }
};
