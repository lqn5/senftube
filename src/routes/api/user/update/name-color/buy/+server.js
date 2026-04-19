import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { inventory, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function POST({ request, locals }) {
    const userId = locals.user?.id;
    const { type } = await request.json();

    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    if(!shop[type]){
        return new Response('Type unknown', { status: 401 })
    }

    const userCoins = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if(userCoins[0].coins < shop[type]){
        return new Response('Not enough Bytes', { status: 401 });
    }

    await db
        .update(user)
        .set({ coins: userCoins[0].coins - shop[type], nameColor: type })
        .where(eq(user.id, userId));

    await db
        .insert(inventory)
        .values({ user: userId, item: type})

    return json(
        { ok: true }
    );
}

const shop = {
    aqua: 400,
    rose: 600,
    gold: 800,
    comic: 1000,
    obsidian: 1200
}