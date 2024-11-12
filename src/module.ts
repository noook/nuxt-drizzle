import { defineNuxtModule, createResolver, logger } from '@nuxt/kit'
import { defineConfig } from 'drizzle-kit'
import { generateSQLiteDrizzleJson, type DrizzleSQLiteSnapshotJSON } from 'drizzle-kit/api'
import {} from 'node:fs'
import type { BirpcGroup } from 'birpc'
import { onDevToolsInitialized, extendServerRpc } from '@nuxt/devtools-kit'
import { createJiti } from 'jiti'
import { setupDevToolsUI } from './devtools'
import { setupDrizzleStudio } from './studio'
import { initSchemaWatcher } from './watcher'
import { RPC_NAMESPACE, type ClientFunctions, type ServerFunctions } from './rpc-types'
import { prepareFilenames } from './loader'

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

    const drizzleConfigPath = resolver.resolve(nuxt.options.rootDir, 'drizzle.config.ts')
    const drizzleConfig = defineConfig(await import(drizzleConfigPath).then(r => r.default || r))

    if (!drizzleConfig.schema) {
      console.warn('No schema path found in drizzle.config.ts')
      return
    }

    nuxt.hook('builder:watch', (event, path) => {
      if (drizzleConfigPath === resolver.resolve(nuxt.options.rootDir, path)) {
        logger.info(`Restarting Nuxt due to ${path} change`)
        nuxt.callHook('restart')
      }
    })

    const resolvedPaths = (
      Array.isArray(drizzleConfig.schema)
        ? drizzleConfig.schema
        : [drizzleConfig.schema]
    )
      .map(path => resolver.resolve(nuxt.options.rootDir, path))

    let rpc: BirpcGroup<ClientFunctions, ServerFunctions>

    const jiti = createJiti(import.meta.url, { fsCache: false, moduleCache: false })

    const onChange = async (filenames: string[]): Promise<DrizzleSQLiteSnapshotJSON> => {
      const imports: Record<string, unknown> = {}
      for (const path of filenames) {
        const mod = await jiti.import<Record<string, unknown>>(path)
        for (const exp in mod) {
          imports[exp] = mod[exp]
        }
      }

      // @todo: Choose the right generator based on the dialect
      const json = await generateSQLiteDrizzleJson(imports)
      await rpc?.broadcast.setSchema(json)
      return json
    }

    onDevToolsInitialized(async () => {
      rpc = extendServerRpc<ClientFunctions, ServerFunctions>(RPC_NAMESPACE, {
        getSchema() {
          const filenames = prepareFilenames(resolvedPaths)
          return onChange(filenames)
        },
      })

      initSchemaWatcher(nuxt, resolvedPaths, onChange)
    })
  },
})
