---
name: openapi
description: Guidelines for working with OpenAPI specifications in Kubb. Use when dealing with OpenAPI schemas, operations, and code generation from API specs.
---

# OpenAPI Skill

This skill provides guidelines for working with OpenAPI specifications in the Kubb ecosystem.

## Overview

Kubb generates code from OpenAPI specifications (OpenAPI 2.0/3.0/3.1). Understanding how to work with OpenAPI schemas and operations is essential for plugin development and code generation.

## Key Concepts

### OpenAPI Document Structure

An OpenAPI document contains:
- **Info**: Metadata about the API
- **Servers**: API server information
- **Paths**: Available endpoints and operations
- **Components**: Reusable schemas, parameters, responses
- **Security**: Authentication and authorization schemes
- **Tags**: Grouping for operations

### Operations

An operation represents a single API endpoint method (GET, POST, PUT, DELETE, etc.) and includes:
- **operationId**: Unique identifier for the operation
- **summary**: Short description
- **description**: Detailed description
- **parameters**: Query, path, header, and cookie parameters
- **requestBody**: Request payload schema
- **responses**: Possible response schemas
- **tags**: Categorization tags

## Accessing OpenAPI Data

### Using the OAS Hook

```tsx
import { useOas } from '@kubb/plugin-oas/hooks'

function MyComponent() {
  const oas = useOas()
  
  // Access OpenAPI document
  const title = oas.api.info.title
  const version = oas.api.info.version
  
  // Get all paths
  const paths = oas.api.paths
  
  // Get all schemas
  const schemas = oas.api.components?.schemas
}
```

### Using Operation Manager

```tsx
import { useOperationManager } from '@kubb/plugin-oas/hooks'

function MyComponent({ operation }) {
  const { getName, getSchemas } = useOperationManager()
  
  // Get operation name
  const name = getName(operation, { type: 'function' })
  
  // Get schemas for operation
  const schemas = getSchemas(operation)
  
  // Access operation details
  const method = operation.method
  const path = operation.path
  const operationId = operation.operation.operationId
}
```

## Working with Schemas

### Schema Types

Kubb works with various schema types:
- **object**: Object with properties
- **array**: Array of items
- **string**: String value
- **number**: Numeric value
- **integer**: Integer value
- **boolean**: Boolean value
- **enum**: Enumeration of values
- **ref**: Reference to another schema ($ref)

### Resolving Schema References

```tsx
import { useOas } from '@kubb/plugin-oas/hooks'

function resolveSchema(schemaRef: string) {
  const oas = useOas()
  
  // Resolve $ref to actual schema
  const schema = oas.getSchema(schemaRef)
  return schema
}
```

### Schema Properties

```tsx
function getSchemaProperties(schema: SchemaObject) {
  const properties = schema.properties || {}
  const required = schema.required || []
  
  return Object.entries(properties).map(([name, prop]) => ({
    name,
    type: prop.type,
    required: required.includes(name),
    description: prop.description,
  }))
}
```

## Operation Patterns

### Grouping Operations

Operations can be grouped by:
- **Tag**: Using OpenAPI tags
- **Path**: Based on URL path structure
- **Operation**: Individual operations

```typescript
// In plugin options
{
  group: {
    type: 'tag', // or 'operation'
    name: ({ group }) => `${group}Controller`
  }
}
```

### Filtering Operations

```typescript
// In plugin options
{
  include: [
    {
      type: 'tag',
      pattern: 'pets',
    },
  ],
  exclude: [
    {
      type: 'operationId',
      pattern: 'findPetsByStatus',
    },
  ],
}
```

## Parameter Handling

### Parameter Types

OpenAPI parameters can be in:
- **path**: URL path parameters
- **query**: Query string parameters
- **header**: HTTP headers
- **cookie**: Cookie parameters

### Working with Parameters

```tsx
function getOperationParameters(operation: Operation) {
  const parameters = operation.operation.parameters || []
  
  return parameters.map(param => ({
    name: param.name,
    in: param.in,
    required: param.required,
    schema: param.schema,
    description: param.description,
  }))
}
```

## Request and Response Bodies

### Request Body

```tsx
function getRequestBody(operation: Operation) {
  const requestBody = operation.operation.requestBody
  
  if (!requestBody) return null
  
  const content = requestBody.content
  const jsonContent = content?.['application/json']
  
  return {
    required: requestBody.required,
    schema: jsonContent?.schema,
  }
}
```

### Response Schemas

```tsx
function getResponseSchemas(operation: Operation) {
  const responses = operation.operation.responses || {}
  
  return Object.entries(responses).map(([status, response]) => ({
    status,
    description: response.description,
    schema: response.content?.['application/json']?.schema,
  }))
}
```

## Content Type Handling

### Supported Content Types

Common content types in OpenAPI:
- `application/json`: JSON data
- `application/xml`: XML data
- `multipart/form-data`: File uploads
- `application/x-www-form-urlencoded`: Form data
- `text/plain`: Plain text

### Content Type in Plugin Options

```typescript
{
  contentType: 'application/json', // Default content type
}
```

## Common Patterns

### Generating Code per Operation

```tsx
export const myGenerator = createReactGenerator({
  name: 'my-generator',
  async operation({ operation, plugin }) {
    const name = plugin.resolveName(operation)
    
    return (
      <File baseName={name} path={plugin.resolvePath(name)}>
        <MyOperationComponent operation={operation} />
      </File>
    )
  },
})
```

### Generating Code per Schema

```tsx
export const schemaGenerator = createReactGenerator({
  name: 'schema-generator',
  async schema({ schema, plugin }) {
    const name = schema.name
    
    return (
      <File baseName={name} path={plugin.resolvePath(name)}>
        <MySchemaComponent schema={schema} />
      </File>
    )
  },
})
```

## Best Practices

1. **Always handle optional fields**: OpenAPI schemas can have optional properties
2. **Check for $ref**: Schemas can reference other schemas
3. **Handle multiple content types**: Operations can support multiple content types
4. **Validate operation IDs**: Ensure operationId exists or generate one
5. **Handle arrays and objects**: Complex schemas need proper handling
6. **Consider enums**: Enum values should be typed properly
7. **Handle oneOf/anyOf/allOf**: Complex schema compositions need special handling

## Standard Example File

Use `petStore.yaml` as the standard example OpenAPI specification in documentation and tests.

## Common Issues

### Missing Operation ID

Some OpenAPI specs don't have operationId. Generate one from method and path:

```typescript
const operationId = operation.operation.operationId || 
  `${operation.method}${operation.path.replace(/[^a-zA-Z0-9]/g, '')}`
```

### Circular References

Handle circular schema references carefully:

```typescript
const seen = new Set()

function processSchema(schema, schemaRef) {
  if (seen.has(schemaRef)) {
    return // Already processed
  }
  seen.add(schemaRef)
  // Process schema
}
```

## Resources

- OpenAPI Specification: https://spec.openapis.org/oas/latest.html
- Kubb OAS Plugin: `/plugins/plugin-oas/`
