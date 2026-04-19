import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { badgeEquips, badgeInventory } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
    const userId = locals.user?.id;
    const { badgeId } = await request.json();

    if (!userId) {
        return json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!validBadges.includes(badgeId)) {
        return json({ ok: false, message: "Badge unbekannt" }, { status: 400 });
    }

    const [existing] = await db
        .select()
        .from(badgeEquips)
        .where(and(
            eq(badgeEquips.user, userId),
            eq(badgeEquips.badgeId, badgeId)
        ))
        .limit(1);

    if (existing) {
        await db
            .delete(badgeEquips)
            .where(and(
                eq(badgeEquips.user, userId),
                eq(badgeEquips.badgeId, badgeId)
            ));

        return json({ ok: true, equipped: false });
    } else {
        const [ownedBadge] = await db
            .select()
            .from(badgeInventory)
            .where(and(
                eq(badgeInventory.user, userId),
                eq(badgeInventory.badgeId, badgeId)
            ))
            .limit(1);

        if (!ownedBadge) {
            return json({ ok: false, message: "Badge wurde nicht gekauft" }, { status: 403 });
        }

        const badgesEquipped = await db
            .select()
            .from(badgeEquips)
            .where(eq(badgeEquips.user, userId));

        if (badgesEquipped.length >= 3) {
            return json({ ok: false, message: "Maximal 3 Badges gleichzeitig" }, { status: 400 });
        }

        await db
            .insert(badgeEquips)
            .values({
                user: userId,
                badgeId
            });

        return json({ ok: true, equipped: true });
    }
}

//\CUSTOMIZE: add badge ids to array

const validBadges = [
    "examplebadge", "examplebadge2"
]
