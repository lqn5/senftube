import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { giftCodes, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function GET({ locals }) {
  const userObject = locals.user;
  if (userObject?.role != "admin") {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await db.select().from(giftCodes);

  return json(
    { result }
  );
}
