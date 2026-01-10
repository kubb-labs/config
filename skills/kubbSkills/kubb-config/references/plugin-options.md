# Plugin Options Reference

## Common Options (All Plugins)

### output
```typescript
{
  output: {
    path: 'dirname',        // Subdirectory relative to config output
    barrelType: 'named'     // 'named' | 'all' - barrel export type
  }
}
```

### group
```typescript
{
  group: {
    type: 'tag',            // 'tag' | 'operation'
    name: ({ group }) => `${group}Controller`  // Custom naming function
  }
}
```

### include/exclude
```typescript
{
  include: [
    { type: 'tag', pattern: 'pets' },
    { type: 'operationId', pattern: 'findPets' }
  ],
  exclude: [
    { type: 'operationId', pattern: 'deprecated*' }
  ]
}
```

## TypeScript Plugin (`@kubb/plugin-ts`)

```typescript
import { pluginTs } from '@kubb/plugin-ts'

pluginTs({
  output: { path: 'models' },
  enumType: 'asConst',          // 'enum' | 'asConst' | 'literal'
  enumSuffix: 'Enum',           // Suffix for enum types
  dateType: 'date',             // 'string' | 'date'
  optionalType: 'questionToken', // 'questionToken' | 'undefined'
  exportType: 'named'           // 'named' | 'default'
})
```

## Zod Plugin (`@kubb/plugin-zod`)

```typescript
import { pluginZod } from '@kubb/plugin-zod'

pluginZod({
  output: { path: 'zod' },
  coerce: false,    // Enable type coercion (z.coerce.number())
  typed: true,      // Generate TypeScript types alongside schemas
  dateType: 'date'  // 'string' | 'date'
})
```

## React Query Plugin (`@kubb/plugin-react-query`)

```typescript
import { pluginReactQuery } from '@kubb/plugin-react-query'

pluginReactQuery({
  output: { path: 'hooks' },
  infinite: true,   // Generate useInfiniteQuery hooks
  suspense: true,   // Generate useSuspenseQuery hooks
  query: {
    key: (operation) => [operation.operationId],  // Custom query key
    methods: ['get']  // Only generate for GET operations
  },
  mutation: {
    key: (operation) => [operation.operationId],
    methods: ['post', 'put', 'patch', 'delete']
  }
})
```

## Client Plugin (`@kubb/plugin-client`)

```typescript
import { pluginClient } from '@kubb/plugin-client'

pluginClient({
  output: { path: 'client' },
  importPath: '@kubb/plugin-client/client',  // Import path for client
  dataReturnType: 'data'  // 'data' | 'full' - return data or full response
})
```

## Faker Plugin (`@kubb/plugin-faker`)

```typescript
import { pluginFaker } from '@kubb/plugin-faker'

pluginFaker({
  output: { path: 'mocks' },
  dateType: 'date',     // 'string' | 'date'
  seed: [123]           // Seed for reproducible mocks
})
```
