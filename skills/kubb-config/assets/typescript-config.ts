import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig({
  input: {
    path: './petStore.yaml'
  },
  output: {
    path: './src/gen',
    clean: true
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: { path: 'models' },
      enumType: 'asConst'
    })
  ]
})
