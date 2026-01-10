---
name: kubb-react-components
description: Guidelines for creating React components with @kubb/react-fabric. Use when building code generation components for Kubb plugins.
---

# Kubb React Components Skill

This skill provides guidelines for creating React components using `@kubb/react-fabric` for code generation in Kubb plugins.

## Overview

Kubb uses React components to declaratively generate code. The `@kubb/react-fabric` library provides components that render to code strings instead of DOM elements.

## Core Concepts

### KubbNode

All components return `KubbNode` instead of ReactNode:

```tsx
import type { KubbNode } from '@kubb/react-fabric/types'

export function MyComponent(): KubbNode {
  return <File.Source name="myFile">
    {/* Content */}
  </File.Source>
}
```

### Component Philosophy

- **Declarative**: Use JSX to describe what code to generate
- **Composable**: Break complex generators into smaller components
- **Reusable**: Share components across plugins
- **Typed**: Full TypeScript support

## Available Components

### File Components

#### File.Source

Creates a source file with content:

```tsx
import { File } from '@kubb/react-fabric'

<File.Source name="MyFile" isExportable isIndexable>
  {/* File contents */}
</File.Source>
```

**Props:**
- `name`: File name (without extension)
- `isExportable`: Include in barrel exports
- `isIndexable`: Include in index files

#### File.Import

Add imports to the file:

```tsx
<File.Import name="useState" path="react" />
<File.Import name={['type1', 'type2']} path="./types" isTypeOnly />
<File.Import name="*" alias="utils" path="./utils" />
```

**Props:**
- `name`: Import name(s)
- `path`: Module path
- `isTypeOnly`: Type-only import
- `alias`: Import alias (for `* as alias`)

### Function Components

#### Function

Create a function declaration:

```tsx
import { Function } from '@kubb/react-fabric'

<Function name="myFunction" export async params="(id: string)">
  {`return fetch(\`/api/\${id}\`)`}
</Function>
```

**Props:**
- `name`: Function name
- `export`: Export the function
- `async`: Async function
- `params`: Function parameters
- `returnType`: Return type annotation
- `generics`: Generic type parameters

#### Function.Arrow

Create an arrow function:

```tsx
<Function.Arrow name="myFunc" export const params="(x: number)">
  {`return x * 2`}
</Function.Arrow>
```

### Type Components

#### Type

Create a type definition:

```tsx
import { Type } from '@kubb/react-fabric'

<Type name="MyType" export>
  {`{ id: string; name: string }`}
</Type>
```

**Props:**
- `name`: Type name
- `export`: Export the type
- `generics`: Generic type parameters

#### Interface

Create an interface:

```tsx
import { Interface } from '@kubb/react-fabric'

<Interface name="MyInterface" export>
  {`id: string\nname: string`}
</Interface>
```

### Const Components

#### Const

Create a const declaration:

```tsx
import { Const } from '@kubb/react-fabric'

<Const name="API_URL" export>
  {`'https://api.example.com'`}
</Const>
```

**Props:**
- `name`: Variable name
- `export`: Export the const
- `asConst`: Add `as const` assertion

### Class Components

#### Class

Create a class:

```tsx
import { Class } from '@kubb/react-fabric'

<Class name="MyClass" export>
  <Class.Constructor params="(private id: string)">
    {`this.id = id`}
  </Class.Constructor>
  
  <Class.Method name="getId" returnType="string">
    {`return this.id`}
  </Class.Method>
</Class>
```

## Using Hooks

### usePluginManager

Access the plugin manager:

```tsx
import { usePluginManager } from '@kubb/react-fabric/hooks'

function MyComponent() {
  const pluginManager = usePluginManager()
  
  const plugin = pluginManager.getPlugin('@kubb/plugin-ts')
  const config = pluginManager.config
}
```

### useOas

Access the OpenAPI specification:

```tsx
import { useOas } from '@kubb/plugin-oas/hooks'

function MyComponent() {
  const oas = useOas()
  
  const title = oas.api.info.title
  const schemas = oas.api.components?.schemas
}
```

### useOperationManager

Access operation utilities:

```tsx
import { useOperationManager } from '@kubb/plugin-oas/hooks'

function MyComponent({ operation }) {
  const { getName, getSchemas } = useOperationManager()
  
  const name = getName(operation, { type: 'function' })
  const schemas = getSchemas(operation)
}
```

## Component Patterns

### Conditional Rendering

```tsx
function MyComponent({ includeComments }: Props): KubbNode {
  return (
    <File.Source name="output">
      {includeComments && '// This is a comment\n'}
      <Function name="myFunc">
        {`return true`}
      </Function>
    </File.Source>
  )
}
```

### Iterating Over Collections

```tsx
function TypesComponent({ schemas }: Props): KubbNode {
  return (
    <File.Source name="types">
      {schemas.map(schema => (
        <Type key={schema.name} name={schema.name} export>
          {schema.definition}
        </Type>
      ))}
    </File.Source>
  )
}
```

### Nested Components

```tsx
function ApiComponent({ operations }: Props): KubbNode {
  return (
    <File.Source name="api">
      {operations.map(op => (
        <OperationComponent key={op.id} operation={op} />
      ))}
    </File.Source>
  )
}

function OperationComponent({ operation }: Props): KubbNode {
  return (
    <Function name={operation.name} export async>
      {`return fetch('${operation.path}')`}
    </Function>
  )
}
```

## Best Practices

### 1. Keep Components Focused

Each component should have a single responsibility:

```tsx
// ✅ Good - focused components
function QueryFunction({ operation }) { /* ... */ }
function QueryOptions({ operation }) { /* ... */ }
function QueryHook({ operation }) { /* ... */ }

// ❌ Avoid - doing too much
function QueryEverything({ operation }) { /* generates everything */ }
```

### 2. Use Proper Typing

Always type your component props:

```tsx
import type { KubbNode } from '@kubb/react-fabric/types'
import type { Operation } from '@kubb/oas'

type Props = {
  operation: Operation
  name: string
  options?: ComponentOptions
}

export function MyComponent({ operation, name, options }: Props): KubbNode {
  // ...
}
```

### 3. Handle Edge Cases

```tsx
function TypeComponent({ schema }: Props): KubbNode {
  // Handle missing schema
  if (!schema) {
    return null
  }
  
  // Handle different schema types
  if (schema.type === 'array') {
    return <ArrayType schema={schema} />
  }
  
  if (schema.type === 'object') {
    return <ObjectType schema={schema} />
  }
  
  // Default case
  return <PrimitiveType schema={schema} />
}
```

### 4. Use Fragments for Multiple Elements

```tsx
function MultipleExports(): KubbNode {
  return (
    <>
      <Type name="TypeA" export>
        {`{ a: string }`}
      </Type>
      <Type name="TypeB" export>
        {`{ b: number }`}
      </Type>
    </>
  )
}
```

### 5. Extract Complex Logic

```tsx
// ✅ Good - logic extracted
function getParameters(operation: Operation) {
  return operation.parameters?.map(p => p.name) || []
}

function MyComponent({ operation }: Props): KubbNode {
  const params = getParameters(operation)
  
  return (
    <Function name="myFunc" params={`(${params.join(', ')})`}>
      {/* ... */}
    </Function>
  )
}
```

### 6. Compose Imports Properly

```tsx
function MyComponent(): KubbNode {
  return (
    <File.Source name="output">
      <File.Import name="useState" path="react" />
      <File.Import name={['Type1', 'Type2']} path="./types" isTypeOnly />
      
      <Function name="useMyHook" export>
        {`const [state, setState] = useState()`}
      </Function>
    </File.Source>
  )
}
```

## Common Patterns

### Generating Types from Schema

```tsx
function SchemaType({ schema }: Props): KubbNode {
  const properties = Object.entries(schema.properties || {})
    .map(([key, prop]) => {
      const optional = !schema.required?.includes(key) ? '?' : ''
      return `${key}${optional}: ${prop.type}`
    })
    .join('\n  ')
  
  return (
    <Type name={schema.name} export>
      {`{\n  ${properties}\n}`}
    </Type>
  )
}
```

### Generating Functions with Parameters

```tsx
function ApiFunction({ operation }: Props): KubbNode {
  const params = operation.parameters
    ?.map(p => `${p.name}: ${p.schema.type}`)
    .join(', ') || ''
  
  return (
    <Function 
      name={operation.operationId} 
      export 
      async
      params={`(${params})`}
      returnType="Promise<Response>"
    >
      {`return fetch('${operation.path}')`}
    </Function>
  )
}
```

### Creating React Hooks

```tsx
function QueryHook({ operation }: Props): KubbNode {
  return (
    <File.Source name={`use${operation.name}`}>
      <File.Import name="useQuery" path="@tanstack/react-query" />
      
      <Function.Arrow 
        name={`use${operation.name}`}
        export
        const
        params="(options?: UseQueryOptions)"
      >
        {`return useQuery({
  queryKey: ['${operation.operationId}'],
  queryFn: () => fetch('${operation.path}'),
  ...options
})`}
      </Function.Arrow>
    </File.Source>
  )
}
```

## Testing Components

Test components by rendering them and checking output:

```typescript
import { renderToString } from '@kubb/react-fabric'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render function', () => {
    const result = renderToString(<MyComponent name="test" />)
    
    expect(result).toContain('export function test()')
  })
})
```

## Resources

See `references/react-fabric-api.md` for complete component API reference.
