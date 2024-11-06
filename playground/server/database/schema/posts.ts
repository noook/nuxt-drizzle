import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
})
