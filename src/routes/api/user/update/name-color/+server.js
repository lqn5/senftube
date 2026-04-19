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

    if(!validTypes.includes(type)){
        return new Response('Type unknown', { status: 401 })
    }

    if(type == "default"){
        await db
            .update(user)
            .set({ nameColor: "default" })
            .where(eq(user.id, userId));
    }

    let userInventory = await db.select().from(inventory).where(and(eq(inventory.user, userId)))
    
    userInventory = userInventory.map(value => value.item)

    if(userInventory.includes(type)){
        await db
            .update(user)
            .set({ nameColor: type })
            .where(eq(user.id, userId));
    }
    else{
        return json(
            { status: 403 }
        );
    }
    return json(
        { status: 200 }
    );
}

const validTypes = ["default", "aqua", "gold", "obsidian", "rose", "comic", "neo", "astra", "rainbow"]