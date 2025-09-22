import { eq } from "drizzle-orm";
import { db } from "../../config/db.ts";
import { users } from "../../db/schema.ts";

export const upsertUser = async (id: number, name: string) => {
  const existingUser = await db.select().from(users).where(eq(users.id, id));

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({
      id,
      name,
    })
    .returning();

  return newUser;
};

export const updateUser = async (id: number, name: string) => {
  console.log(id, name);
  const [updatedUser] = await db
    .update(users)
    .set({
      name,
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
};
