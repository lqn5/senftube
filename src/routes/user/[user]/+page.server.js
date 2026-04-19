import { redirect } from '@sveltejs/kit';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';
import { auth } from '$lib/server/auth';
import { badgeEquips, subscriptions, user, videos } from '$lib/server/db/auth.schema';
import { db } from '$lib/server/db';
import { and, desc, eq } from 'drizzle-orm';

export const load = async ({ params, fetch, locals }) => {
	const loggedInUser = locals?.user?.id;
	const profileUserName = params.user;

	if(!profileUserName || !loggedInUser){
		return {};
	}

	const profileUser = await db.select(
		{
			id: user.id,
			name: user.name,
			atHandle: user.atHandle,
			image: user.image,
			bio: user.bio,
			nameColor: user.nameColor,
			coins: user.coins,
			verified: user.verified,
			createdAt: user.createdAt,
			streak: user.streak,
			maxStreak: user.maxStreak,
			role: user.role
		}
	).from(user).where(eq(user.atHandle, profileUserName)).limit(1)

	if(profileUser.length == 0){
		return {};
	}

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
			verified: user.verified,
			atHandle: user.atHandle
		})
		.from(videos)
		.where(eq(videos.user, profileUser[0].id))
		.leftJoin(user, eq(videos.user, user.id))
		.orderBy(desc(videos.id));
		//.limit(20);

	const [ authorSubscriberData, userSubscribedData ] = await Promise.all([
		db.select().from(subscriptions).where(eq(subscriptions.channel, profileUser[0].id )),
		db.select().from(subscriptions).where(and(eq(subscriptions.user, loggedInUser), eq(subscriptions.channel, profileUser[0].id)))
	])
	
	let subscribers = authorSubscriberData.length;

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

	let equippedBadges = await db.select().from(badgeEquips).where(eq(badgeEquips.user, profileUser[0].id));
	
	equippedBadges = equippedBadges.map(value => value.badgeId);

	return { videoData, subscribers, subdata: userSubscribedData[0], profileUser: profileUser[0], equippedBadges };
};
