import { db } from "$lib/server/db";
import { giftCodes, giftCodeUsages, user } from "$lib/server/db/auth.schema";
import { and, eq } from "drizzle-orm";

export async function GET({ url, locals  }) {
    const userId = locals.user?.id;

    if(userId == null){
        return new Response(JSON.stringify({ ok: false }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const codeToCheck = url.searchParams.get('c');

    const codeResult = await db.select().from(giftCodes).where(eq(giftCodes.id, codeToCheck));

    if(codeResult.length == 0){
        return new Response(JSON.stringify({ ok: false }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const userOldCoins = await db.select().from(user).where(eq(user.id, userId));

    const hasUsedBefore = await db.select().from(giftCodeUsages).where(and(eq(giftCodeUsages.user, userId), eq(giftCodeUsages.code, codeToCheck )));

    if(hasUsedBefore.length != 0){
        return new Response(JSON.stringify({ ok: false, message: "Du hast diesen Code schon benutzt" }));
    }

    await db.update(user).set({ coins: userOldCoins[0].coins + codeResult[0].value }).where(eq(user.id, userId));

    await db.insert(giftCodeUsages).values({ user: userId, code: codeToCheck })

    return new Response(JSON.stringify({ ok: true, coins: codeResult[0].value }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
