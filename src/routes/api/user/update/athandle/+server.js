import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  const { atHandle } = await request.json();

  if (!userId) {
    return json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!/^[a-z_öäüß]{2,30}$/.test(atHandle)) {
    return json({ ok: false, message: "Ungültiger @Name" }, { status: 400 });
  }

  const atHandleResult = await db.select().from(user).where(eq(user.atHandle, atHandle));

  if (atHandleResult.length !== 0) {
    return json({ ok: false, message: "Benutzername vergeben!" }, { status: 409 });
  }

  await db
    .update(user)
    .set({ atHandle })
    .where(eq(user.id, userId));

  return json({ ok: true }, { status: 200 });
}
