import { CLOUDFLARE_ID, CLOUDFLARE_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { eq } from "drizzle-orm";

export async function GET({ locals }) {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const oldImage = await db.select().from(user).where(eq(user.id, userId));

  const imagesHeaders = {
    Authorization: `Bearer ${CLOUDFLARE_KEY}`
  };
  if(oldImage[0].image != "9f99e3d5-a3be-444b-8247-13b53bfa4600"){
    let deleteOldImageResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/images/v1/${oldImage[0].image}`,
      { method: 'DELETE', headers: imagesHeaders }
    );
  }

  let imagesResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/images/v2/direct_upload`,
    { method: 'POST', headers: imagesHeaders }
  );

  imagesResponse = await imagesResponse.json();
  
  await db
    .update(user)
    .set({ image: imagesResponse.result.id })
    .where(eq(user.id, userId));
    
  return json(
    { uploadURL: imagesResponse.result.uploadURL },
    { status: 201 }
  );
}
