import { consola } from 'consola'
import { defineNuxtModule } from 'nuxt/kit'
import { addCustomTab, startSubprocess } from '@nuxt/devtools-kit'

export default defineNuxtModule({
  meta: {
    name: 'drizzle-studio',
  },
  setup(_options, nuxt) {
    if (!nuxt.options.dev) {
      return
    }

    console.log('rootDir', nuxt.options.rootDir)
    const { getProcess, terminate } = startSubprocess(
      {
        command: 'npx',
        args: ['drizzle-kit', 'studio'],
        cwd: nuxt.options.rootDir,
      },
      {
        id: 'nuxt-drizzle-kit--studio',
        name: 'Drizzle Studio',
      },
    )
    const { stderr, stdout } = getProcess()

    stdout?.on('data', (data) => {
      consola.log('`Drizzle:`', data.toString())
    })

    stderr?.on('data', (data) => {
      consola.error('`Drizzle:`', data.toString())
    })

    addCustomTab({
      name: 'dizzle-studio',
      title: 'Drizzle Studio',
      icon: 'simple-icons:drizzle',
      view: {
        type: 'iframe',
        src: 'https://local.drizzle.studio',
      },
    })

    nuxt.hook('close', () => terminate())
  },
})
