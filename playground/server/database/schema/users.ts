import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
})
