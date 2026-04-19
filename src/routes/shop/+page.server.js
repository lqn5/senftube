import { and, eq } from 'drizzle-orm';
import { badgeEquips, badgeInventory, inventory, user as userTable } from "$lib/server/db/auth.schema";
import { db } from '$lib/server/db';

export const load = async (event) => {
    const sessionUser = event.locals.user;
    if (!sessionUser) return { user: null };

    const additionalUserData = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, sessionUser.id));

    let userBadges = await db.select().from(badgeInventory).where(eq(badgeInventory.user, sessionUser.id));
    let equippedBadges = await db.select().from(badgeEquips).where(eq(badgeEquips.user, sessionUser.id));

    userBadges = userBadges.map(value => value.badgeId);
    equippedBadges = equippedBadges.map(value => value.badgeId);

    const user = { ...sessionUser, ...additionalUserData[0], userBadges, equippedBadges };
    return { user };
};