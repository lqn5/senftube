import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { badgeInventory, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
    const userId = locals.user?.id;
    const { badgeId } = await request.json();

    if (!userId) {
        return json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    if(!shop[badgeId]){
        return json({ ok: false, message: "Badge unbekannt" }, { status: 400 });
    }

    const [ownedBadge] = await db
        .select()
        .from(badgeInventory)
        .where(and(
            eq(badgeInventory.user, userId),
            eq(badgeInventory.badgeId, badgeId)
        ))
        .limit(1);

    if (ownedBadge) {
        return json({ ok: false, message: "Badge bereits gekauft" }, { status: 409 });
    }

    const [currentUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if (!currentUser) {
        return json({ ok: false, message: "Benutzer nicht gefunden" }, { status: 404 });
    }

    if(currentUser.coins < shop[badgeId]){
        return json({ ok: false, message: "Nicht genug Bytes" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
        await tx
            .update(user)
            .set({ coins: currentUser.coins - shop[badgeId]})
            .where(eq(user.id, userId));

        await tx
            .insert(badgeInventory)
            .values({ user: userId, badgeId});
    });

    return json(
        { ok: true }
    );
}

//\CUSTOMIZE: add badge ids: price to array

const shop = {
    examplebadge: 100,
    examplebadge2: 200
}
