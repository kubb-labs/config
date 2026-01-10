import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig([
  {
    name: 'petStore',
    input: {
      path: './specs/petStore.yaml'
    },
    output: {
      path: './src/gen/petStore',
      clean: true
    },
    plugins: [
      pluginOas(),
      pluginTs({
        output: { path: 'models' }
      })
    ]
  },
  {
    name: 'userApi',
    input: {
      path: './specs/userApi.yaml'
    },
    output: {
      path: './src/gen/userApi',
      clean: true
    },
    plugins: [
      pluginOas(),
      pluginTs({
        output: { path: 'models' }
      })
    ]
  },
  {
    name: 'paymentApi',
    input: {
      path: './specs/paymentApi.yaml'
    },
    output: {
      path: './src/gen/paymentApi',
      clean: true
    },
    plugins: [
      pluginOas(),
      pluginTs({
        output: { path: 'models' }
      })
    ]
  }
])
