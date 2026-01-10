# Basic Structure

Minimal `kubb.config.ts` template:

```typescript
import { defineConfig } from '@kubb/core'

export default defineConfig({
  input: {
    path: './openapi.yaml'  // Path to your OpenAPI specification
  },
  output: {
    path: './src/gen',      // Where generated files will be written
    clean: true             // Clean directory before generating
  },
  plugins: [
    // Add plugins here
  ]
})
```

## Input Options

### File Path
```typescript
input: {
  path: './petStore.yaml'
}
```

### Inline Data
```typescript
input: {
  data: {
    openapi: '3.0.0',
    info: {
      title: 'Pet Store API',
      version: '1.0.0'
    },
    paths: {
      // ... OpenAPI specification
    }
  }
}
```

## Output Options

```typescript
output: {
  path: './src/gen',  // Output directory
  clean: true         // Remove old files before generating (recommended)
}
```
