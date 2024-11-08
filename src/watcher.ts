import chokidar from 'chokidar'
import type { Nuxt } from 'nuxt/schema'
import { prepareFilenames } from './loader'

export function initSchemaWatcher(nuxt: Nuxt, schemaPaths: string[], onChange: (path: string[]) => void) {
  const filenames = prepareFilenames(schemaPaths)
  const _onChange = () => onChange(filenames)

  chokidar
    .watch(schemaPaths)
    .on('add', _onChange)
    .on('change', _onChange)
    .on('unlink', _onChange)
}
