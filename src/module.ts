import { defineNuxtModule, addPlugin, createResolver, logger } from '@nuxt/kit'
import { defineConfig } from 'drizzle-kit'
import { generateSQLiteDrizzleJson } from 'drizzle-kit/api'
import { setupDevToolsUI } from './devtools'
import { setupDrizzleStudio } from './studio'
import { initSchemaWatcher } from './watcher'

export interface ModuleOptions {
  /**
   * Enable Drizzle Studio integration
   *
   * @default true
   */
  studio: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-drizzle',
    configKey: 'drizzle',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    studio: true,
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    setupDevToolsUI(nuxt, resolver)

    if (options.studio) {
      setupDrizzleStudio(nuxt)
    }

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    const drizzleConfigPath = resolver.resolve(nuxt.options.rootDir, 'drizzle.config.ts')
    const drizzleConfig = defineConfig(await import(drizzleConfigPath).then(r => r.default || r))

    if (!drizzleConfig.schema) {
      console.warn('No schema path found in drizzle.config.ts')
      return
    }

    const resolvedPaths = (
      Array.isArray(drizzleConfig.schema)
        ? drizzleConfig.schema
        : [drizzleConfig.schema]
    )
      .map(path => resolver.resolve(nuxt.options.rootDir, path))

    // @todo: find a way to watch the schema files
    const onChange = async (filenames: string[]) => {
      const imports: Record<string, unknown> = {}
      for (const path of filenames) {
        const mod = await import(path)
        for (const exp in mod) {
          imports[exp] = mod[exp]
        }
      }

      // @todo: Choose the right generator based on the dialect
      const json = await generateSQLiteDrizzleJson(imports)
      console.log(json)
    }

    initSchemaWatcher(nuxt, resolvedPaths, onChange)

    nuxt.hook('builder:watch', (event, path) => {
      if (drizzleConfigPath === resolver.resolve(nuxt.options.rootDir, path)) {
        logger.info(`Restarting Nuxt due to ${path} change`)
        nuxt.callHook('restart')
      }
    })
  },
})
