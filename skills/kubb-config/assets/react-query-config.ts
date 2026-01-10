import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'

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
      output: { path: 'models' }
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
      infinite: true
    })
  ]
})
