import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from "$env/static/private";
import { db } from "$lib/server/db";
import { videos } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const uploadLength = request.headers.get('Upload-Length');
  const uploadMetadata = request.headers.get('Upload-Metadata');
  const uploadToken = request.headers.get('Upload-Token');

  if (!uploadLength) {
    return new Response('Missing Upload-Length', { status: 400 });
  }

  const uploadAuthResult = await db
    .select()
    .from(videos)
    .where(and(eq(videos.status, "pending"), eq(videos.uploadToken, uploadToken), eq(videos.user, userId)));

  if(uploadAuthResult.length == 0 || uploadAuthResult[0]?.user != userId){
    return new Response("Unauthorized", { status: 401})
  }

  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_KEY}`,
    'Tus-Resumable': '1.0.0',
    'Upload-Length': uploadLength,
    'Upload-Creator': userId
  };

  if (uploadMetadata) {
    headers['Upload-Metadata'] = uploadMetadata;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/stream?direct_user=true`,
    { method: 'POST', headers }
  );

  const location = response.headers.get('Location');
  const mediaId = response.headers.get('stream-media-id');
  
  const imagesHeaders = {
    Authorization: `Bearer ${CLOUDFLARE_KEY}`
  };

  let imagesResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/images/v2/direct_upload`,
    { method: 'POST', headers: imagesHeaders }
  );

  imagesResponse = await imagesResponse.json();
  
  await db
    .update(videos)
    .set({ uploadToken: null, status: "ready", videoFile: mediaId, thumbnail: imagesResponse.result.id })
    .where(and(eq(videos.uploadToken, uploadToken), eq(videos.user, userId)));

  return new Response(null, {
    status: 201,
    headers: {
      Location: location,
      'Tus-Resumable': '1.0.0',
      'stream-media-id': mediaId ?? '',
      'x-image-upload-url': imagesResponse.result.uploadURL ?? ''
    }
  });
}
