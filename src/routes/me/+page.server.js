import { and, eq } from 'drizzle-orm';
import { inventory, user as userTable } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (!sessionUser) return { user: null };

    const additionalUserData = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, sessionUser.id));

    let userInventory = await db.select().from(inventory).where(eq(inventory.user, sessionUser.id))
    
    userInventory = userInventory.map(value => value.item)

    const user = { ...sessionUser, ...additionalUserData[0], inventory: userInventory };

    return { user };
};