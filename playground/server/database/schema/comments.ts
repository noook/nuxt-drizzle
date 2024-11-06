import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { posts } from './posts'

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
})
