import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth.schema";
import { eq } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  const { bio } = await request.json();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if(bio.length == 0){
    return new Response('Bio too short', { status: 413  })
  }

  if(bio.length > 150){
    return new Response('Bio too long', { status: 413  })
  }

  if(bio.split(/\r?\n/).length > 10) {
    return new Response('Bio too long', { status: 413  })
  }


  await db
    .update(user)
    .set({ bio })
    .where(eq(user.id, userId));
    
  return json(
    { status: 200 }
  );
}
