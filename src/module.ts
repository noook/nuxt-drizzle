import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import type { Config as DrizzleConfig } from 'drizzle-kit'
import { defineConfig } from 'drizzle-kit'
import { getTableColumns, getTableName } from 'drizzle-orm'
import { hasMagic } from 'glob'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    const drizzleConfigPath = resolver.resolve(_nuxt.options.rootDir, 'drizzle.config.ts')
    const { default: mod } = await import(drizzleConfigPath)
    const drizzleConfig = defineConfig(mod)

    async function watchSchemas(schemaPath: DrizzleConfig['schema']) {
      if (!schemaPath || Array.isArray(schemaPath)) {
        return
      }

      // Handle globs
      if (hasMagic(schemaPath)) {
        return
      }

      const resolvedSchemaEntry = resolver.resolve(_nuxt.options.rootDir, schemaPath)
      const schema = await import(resolvedSchemaEntry)
      for (const key in schema) {
        const table = schema[key]
        console.log(`Found table "${getTableName(table)}" with columns: [${Object.keys(getTableColumns(table)).join(', ')}]`)
      }

      _nuxt.hook('builder:watch', async (event, path) => {
        // Check if path is a child of schemaPath
      })
    }

    watchSchemas(drizzleConfig.schema)
  },
})
