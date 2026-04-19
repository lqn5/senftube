import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { giftCodes, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userObject = locals.user;
  const { name, value } = await request.json();

  if (userObject?.role != "admin" || !value || !name || name.length == 0 || isNaN(value)) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.insert(giftCodes).values({ id: name, value })

  return json(
    { status: 200 }
  );
}
