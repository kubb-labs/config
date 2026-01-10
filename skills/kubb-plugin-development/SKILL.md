---
name: kubb-plugin-development
description: Guidelines for developing Kubb plugins. Use when creating or modifying Kubb plugins and understanding the plugin architecture.
---

# Kubb Plugin Development Skill

This skill provides comprehensive guidelines for developing plugins in the Kubb ecosystem.

## Plugin System Overview

Kubb uses a plugin-based architecture where plugins generate code from OpenAPI specifications. The system is inspired by Rollup, Unplugin, and Snowpack.

**Key concepts:**
- **PluginManager**: Orchestrates plugin execution and manages file generation lifecycle
- **Plugins**: Define generators, resolve paths/names, and hook into lifecycle events
- **Generators**: Functions or React components that generate code files
- **Components**: React components (using `@kubb/react-fabric`) that render code templates
- **Options**: Plugin configuration that gets resolved and validated

## Plugin Structure

Plugins follow this structure:

```typescript
export const definePlugin = createPlugin<PluginOptions>((options) => {
  return {
    name: pluginName,
    options,
    pre: [], // Plugins that must run before this one
    post: [], // Plugins that run after this one
    resolvePath(baseName, mode, options) { /* ... */ },
    resolveName(name, type) { /* ... */ },
    async install() { /* ... */ },
  }
})
```

## Components

Components are React components (using `@kubb/react-fabric`) that generate code templates. They use JSX syntax to declaratively create files.

**Location**: `packages/plugin-*/src/components/`

**Example structure**:

```tsx
import { File, Function, FunctionParams } from '@kubb/react-fabric'
import type { KubbNode } from '@kubb/react-fabric/types'

export function Query({ name, operation, typeSchemas, ...props }: Props): KubbNode {
  return (
    <File.Source name={name} isExportable isIndexable>
      <Function name={name} export params={params.toConstructor()}>
        {/* Generated code */}
      </Function>
    </File.Source>
  )
}
```

**Key points**:
- Components return `KubbNode` (JSX elements)
- Use `@kubb/react-fabric` components like `<File>`, `<Function>`, `<Const>`, `<Type>`, etc.
- Components are composable and reusable
- Access plugin context via hooks: `usePluginManager()`, `useOas()`, `useOperationManager()`

## Generators

Generators define how code is generated. There are two types:

### 1. Function-based generators

Return `Promise<KubbFile.File[]>`:

```typescript
import { createGenerator } from '@kubb/plugin-oas/generators'

export const myGenerator = createGenerator({
  name: 'my-generator',
  async operation(props) {
    // props: { generator, config, operation, plugin }
    return [/* KubbFile.File[] */]
  },
  async operations(props) {
    // props: { generator, config, operations, plugin }
    return [/* KubbFile.File[] */]
  },
  async schema(props) {
    // props: { generator, config, schema, plugin }
    return [/* KubbFile.File[] */]
  },
})
```

### 2. React-based generators (recommended)

Use `createReactGenerator` and return JSX components:

```tsx
import { createReactGenerator } from '@kubb/plugin-oas/generators'
import { File } from '@kubb/react-fabric'
import { Query } from '../components/Query'

export const queryGenerator = createReactGenerator({
  name: 'query',
  async operation(props) {
    const { operation, plugin } = props
    
    return (
      <Query 
        name={plugin.resolveName(operation)} 
        operation={operation}
      />
    )
  },
})
```

## Plugin Lifecycle

Plugins participate in these lifecycle events:

1. **Install phase**: Plugin initialization and setup
2. **Build phase**: Code generation
3. **Resolve phase**: Path and name resolution
4. **Write phase**: File writing to disk

## Plugin Options Pattern

Define plugin options with TypeScript types and Zod validation:

```typescript
import { z } from 'zod'

// Type definition
export type PluginOptions = {
  output?: {
    path: string
  }
  group?: {
    type: 'tag' | 'operation'
  }
  // ... other options
}

// Zod schema for validation
const optionsSchema = z.object({
  output: z.object({
    path: z.string().default('models'),
  }).optional(),
  group: z.object({
    type: z.enum(['tag', 'operation']).default('tag'),
  }).optional(),
})

// In plugin definition
export const definePlugin = createPlugin<PluginOptions>((userOptions) => {
  const options = optionsSchema.parse(userOptions)
  // ...
})
```

## Plugin Dependencies

Specify plugin dependencies using `pre` and `post` arrays:

```typescript
export const definePlugin = createPlugin<PluginOptions>((options) => {
  return {
    name: pluginName,
    pre: ['@kubb/plugin-oas'], // This plugin must run after plugin-oas
    post: [], // No required post-dependencies
    // ...
  }
})
```

## Accessing OpenAPI Specification

Use hooks to access the OpenAPI spec and operations:

```tsx
import { useOas, useOperationManager } from '@kubb/plugin-oas/hooks'

function MyComponent() {
  const oas = useOas() // Get OpenAPI document
  const { getName } = useOperationManager() // Get operation utilities
  
  // Use oas and operation utilities
}
```

## File Generation Patterns

### Creating a single file per operation

```tsx
export const myGenerator = createReactGenerator({
  name: 'my-generator',
  async operation({ operation, plugin }) {
    const name = plugin.resolveName(operation)
    const path = plugin.resolvePath(name)
    
    return (
      <File baseName={name} path={path}>
        <MyComponent operation={operation} />
      </File>
    )
  },
})
```

### Creating multiple files per schema

```tsx
export const schemaGenerator = createReactGenerator({
  name: 'schema-generator',
  async schema({ schema, plugin }) {
    const files = []
    
    // Generate type file
    files.push(
      <File baseName={`${schema.name}.ts`} path={plugin.resolvePath(schema.name)}>
        <TypeComponent schema={schema} />
      </File>
    )
    
    // Generate validator file
    files.push(
      <File baseName={`${schema.name}.validator.ts`} path={plugin.resolvePath(`${schema.name}.validator`)}>
        <ValidatorComponent schema={schema} />
      </File>
    )
    
    return files
  },
})
```

## Testing Plugins

Test files named `*.test.ts` or `*.test.tsx` in `src` folders.

### Testing generators

```typescript
import { createMockPluginManager } from '@kubb/core/mocks'
import { myGenerator } from './generators'

describe('myGenerator', () => {
  it('should generate files for operation', async () => {
    const manager = createMockPluginManager()
    const operation = createMockOperation()
    
    const files = await myGenerator.operation({
      generator: myGenerator,
      config: {},
      operation,
      plugin: mockPlugin,
    })
    
    expect(files).toHaveLength(1)
    expect(files[0].path).toBe('expected/path')
  })
})
```

## Best Practices

1. **Prefer React-based generators**: They provide better composability and reusability
2. **Use hooks for context**: Access plugin manager, OAS, and operation manager via hooks
3. **Validate options**: Use Zod schemas to validate plugin options
4. **Follow naming conventions**: Use `camelCase` for files/directories, `PascalCase` for types/components
5. **Keep components focused**: Each component should have a single responsibility
6. **Document your plugin**: Follow the plugin documentation template
7. **Test thoroughly**: Write unit tests for generators and components
8. **Handle edge cases**: Consider optional properties, arrays, unions, etc.

## Component Utilities

### Using File components

```tsx
import { File } from '@kubb/react-fabric'

<File.Source name="MyFile" isExportable isIndexable>
  {/* Content */}
</File.Source>
```

### Using Function components

```tsx
import { Function } from '@kubb/react-fabric'

<Function name="myFunction" export params="(arg: string)">
  {`return arg.toUpperCase()`}
</Function>
```

### Using Type components

```tsx
import { Type } from '@kubb/react-fabric'

<Type name="MyType" export>
  {`{ id: string; name: string }`}
</Type>
```

## Resources

See `references/plugin-examples.md` for complete plugin examples and patterns.
