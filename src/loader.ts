import fs from 'node:fs'
import Path from 'node:path'
import * as glob from 'glob'
import { consola } from 'consola'

export const prepareFilenames = (path: string | string[]) => {
  if (typeof path === 'string') {
    path = [path]
  }

  const result = path.reduce((result, cur) => {
    const globbed = glob.sync(cur)

    globbed.forEach((it) => {
      const fileName = fs.lstatSync(it).isDirectory() ? null : Path.resolve(it)

      const filenames = fileName
        ? [fileName]
        : fs.readdirSync(it).map(file => Path.join(Path.resolve(it), file))

      filenames
        .filter(file => !fs.lstatSync(file).isDirectory())
        .forEach(file => result.add(file))
    })

    return result
  }, new Set<string>())
  const res = [...result]

  // when schema: "./schema" and not "./schema.ts"
  if (res.length === 0) {
    consola.error(
      `No schema files found for path config [${
        path
          .map(it => `'${it}'`)
          .join(', ')
      }]`,
    )
    consola.error(
      `If path represents a file - please make sure to use .ts or other extension in the path`,
    )
    process.exit(1)
  }

  return res
}
