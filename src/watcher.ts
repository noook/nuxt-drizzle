import chokidar from 'chokidar'
import { useThrottleFn } from '@vueuse/core'
import type { Nuxt } from 'nuxt/schema'
import { prepareFilenames } from './loader'

export function initSchemaWatcher(nuxt: Nuxt, schemaPaths: string[], onChange: (path: string[]) => void) {
  const filenames = prepareFilenames(schemaPaths)
  // Chokidar emits multiple events for a single file change, so we throttle the callback
  const _onChange = useThrottleFn(() => onChange(filenames), 50)

  chokidar
    .watch(schemaPaths)
    .on('all', () => {
      _onChange()
    })
}
