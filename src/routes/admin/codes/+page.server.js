import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { giftCodes } from '$lib/server/db/auth.schema';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (sessionUser?.role != "admin") return redirect(303, "/");

    const codeData = await db
        .select()
        .from(giftCodes)

    const codes = codeData;
    return { codes };
};