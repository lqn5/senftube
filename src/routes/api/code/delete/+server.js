import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { giftCodes, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function DELETE({ request, locals }) {
  const userObject = locals.user;
  const { name } = await request.json();

  if (userObject?.role != "admin" || !name || name.length == 0) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.delete(giftCodes).where(eq(giftCodes.id, name));

  return json(
    { status: 200 }
  );
}
