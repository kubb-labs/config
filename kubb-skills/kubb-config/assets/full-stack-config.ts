import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginClient } from '@kubb/plugin-client'
import { pluginFaker } from '@kubb/plugin-faker'

export default defineConfig({
  input: {
    path: './petStore.yaml'
  },
  output: {
    path: './src/gen',
    clean: true
  },
  plugins: [
    // Core OAS plugin (required first)
    pluginOas(),
    
    // TypeScript types
    pluginTs({
      output: { path: 'models' },
      enumType: 'asConst'
    }),
    
    // Zod validation schemas
    pluginZod({
      output: { path: 'zod' },
      typed: true
    }),
    
    // React Query hooks
    pluginReactQuery({
      output: { path: 'hooks' },
      infinite: true
    }),
    
    // Axios client
    pluginClient({
      output: { path: 'client' }
    }),
    
    // Mock data generators
    pluginFaker({
      output: { path: 'mocks' }
    })
  ]
})
