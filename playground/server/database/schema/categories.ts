import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { posts } from './posts'

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  name: text('name').notNull().unique(),
})

export const postCategories = pgTable('post_categories', {
  postId: integer('post_id').notNull().references(() => posts.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
}, table => [
  primaryKey({ columns: [table.postId, table.categoryId] }),
])
