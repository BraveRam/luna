import { pgTable, uuid, text, integer, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "failed",
  "done",
]);

export const assignmentTypeEnum = pgEnum("assignment_type", [
  "quick",
  "regular",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // UUID PK
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  quickCredits: integer("quick_credits").notNull().default(0),
  regularCredits: integer("regular_credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(), // UUID PK
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  type: assignmentTypeEnum("type").notNull().default("regular"),
  status: assignmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
