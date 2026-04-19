import { eq } from 'drizzle-orm';
import { user as userTable } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (sessionUser?.role != "admin") return redirect(303, "/");

    const userData = await db
        .select()
        .from(userTable)

    const users = userData;
    return { users };
};