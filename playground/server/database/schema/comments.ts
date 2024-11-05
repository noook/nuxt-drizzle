import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { users } from './users'
import { posts } from './posts'

export const comments = pgTable('comments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  postId: integer('post_id').notNull().references(() => posts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
})
