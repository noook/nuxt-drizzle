import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defineConfig } from 'drizzle-kit'
import { generateSQLiteDrizzleJson } from 'drizzle-kit/api'
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

    const drizzleConfigPath = resolver.resolve(_nuxt.options.rootDir, 'drizzle.config.ts')
    const { default: mod } = await import(drizzleConfigPath)
    const drizzleConfig = defineConfig(mod)

    if (!drizzleConfig.schema) {
      console.warn('No schema path found in drizzle.config.ts')
      return
    }

    const resolvedPaths = Array.isArray(drizzleConfig.schema)
      ? drizzleConfig.schema.map(path => resolver.resolve(_nuxt.options.rootDir, path))
      : [resolver.resolve(_nuxt.options.rootDir, drizzleConfig.schema)]

    // @todo: find a way to watch the schema files
    const filenames = prepareFilenames(resolvedPaths)
    console.log(filenames)

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
  },
})
