import { redirect } from '@sveltejs/kit';
import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from '$env/static/private';
import { auth } from '$lib/server/auth';
import { user, videos } from '$lib/server/db/auth.schema';
import { db } from '$lib/server/db';
import { desc, eq, sql } from 'drizzle-orm';

export const load = async ({ url }) => {
    const query = url.searchParams.get('q');

    if(!query || query.length == 0){
        return {}
    }

    if(query.startsWith("@")){
        return redirect(307, "/user/" + query.substring(1))
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
        .orderBy(desc(videos.id))
        .where(
            sql`to_tsvector('german', ${videos.title} || ' ' || coalesce(${videos.description}, '')) @@ websearch_to_tsquery('german', ${query})`
        )
        .leftJoin(user, eq(videos.user, user.id))
        .limit(20);

    const videoData = (
        await Promise.all(
            videoRows.map(async(row) => {
                if (row.status !== "ready") {
                    return null;
                }

                const response = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/stream/` + row.videoFile,
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


                return { ...row, duration };
            })
        )
    ).filter(Boolean);

    return { videoData, query };
};
