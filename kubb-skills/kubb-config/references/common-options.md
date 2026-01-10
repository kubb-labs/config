# Common Options

Options shared across most Kubb plugins.

## output

Define output directory and barrel exports:

```typescript
{
  output: {
    path: 'models',           // Output subdirectory
    barrelType: 'named'       // 'named' | 'all'
  }
}
```

- `path`: Directory relative to main config `output.path`
- `barrelType`: 
  - `'named'`: Export individual named exports
  - `'all'`: Export everything with `export *`

## group

Organize files by OpenAPI tags or operations:

```typescript
{
  group: {
    type: 'tag',              // 'tag' | 'operation'
    name: ({ group }) => `${group}Controller`
  }
}
```

**Examples:**
```typescript
// Group by tag
{ group: { type: 'tag' } }
// Files: pets/getPets.ts, users/getUsers.ts

// Group by operation
{ group: { type: 'operation' } }
// Files: getPets.ts, createPet.ts

// Custom naming
{ 
  group: { 
    type: 'tag',
    name: ({ group }) => `${group.toLowerCase()}-api`
  }
}
// Files: pets-api/getPets.ts
```

## include

Filter operations to include:

```typescript
{
  include: [
    { type: 'tag', pattern: 'pets' },
    { type: 'operationId', pattern: 'findPets' },
    { type: 'path', pattern: '/pets/*' }
  ]
}
```

## exclude

Filter operations to exclude:

```typescript
{
  exclude: [
    { type: 'tag', pattern: 'internal' },
    { type: 'operationId', pattern: 'deprecated*' }
  ]
}
```

Pattern matching supports wildcards (`*`).
