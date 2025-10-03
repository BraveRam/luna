import { eq } from "drizzle-orm";
import { db } from "../../config/db.ts";
import { users } from "../../db/schema.ts";

interface UserPayload {
  name: string;
  email: string
}

export const upsertUser = async (payload: UserPayload) => {
  const existingUser = await db.select().from(users).where(eq(users.email, payload.email));

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  const [newUser] = await db
    .insert(users)
    .values(payload)
    .returning();

  return newUser;
};

// export const updateUser = async (id: number, name: string) => {
//   console.log(id, name);
//   const [updatedUser] = await db
//     .update(users)
//     .set({
//       name,
//     })
//     .where(eq(users.id, id))
//     .returning();

//   return updatedUser;
// };
