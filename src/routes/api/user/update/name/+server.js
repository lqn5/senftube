import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  const { name } = await request.json();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if(name.length == 0){
    return new Response('Name too short', { status: 401 })
  }

  if(name.length > 30){
    return new Response('Name too long', { status: 401 })
  }

  await db
    .update(user)
    .set({ name })
    .where(eq(user.id, userId));
    
  return json({ ok: true }, { status: 200 });
}
