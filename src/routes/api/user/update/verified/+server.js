import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userObject = locals.user;
  const { id } = await request.json();

  if (userObject?.role != "admin") {
    return new Response('Unauthorized', { status: 401 });
  }

  const wasVerified = await db.select().from(user).where(and(eq(user.id, id), eq(user.verified, true)));
  
  if(wasVerified.length == 0){
    await db
      .update(user)
      .set({ verified: true })
      .where(eq(user.id, id));
  }
  else{
    await db
      .update(user)
      .set({ verified: false })
      .where(eq(user.id, id));
  }

  return json(
    { status: 200 }
  );
}
