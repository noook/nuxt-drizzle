import { integer, sqliteTable, primaryKey, text } from 'drizzle-orm/sqlite-core'
import { posts } from './posts'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

export const postCategories = sqliteTable('post_categories', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, table => ({
  pk: primaryKey({ columns: [table.postId, table.categoryId] }),
}))
