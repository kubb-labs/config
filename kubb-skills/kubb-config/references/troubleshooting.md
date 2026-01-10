# Troubleshooting

## Missing pluginOas Error

**Error:** `Plugin 'plugin-ts' requires 'plugin-oas' to be loaded first`

**Cause:** Other plugins depend on `pluginOas()` but it's not included or not first.

**Solution:**
```typescript
// ✗ Wrong
plugins: [
  pluginTs()
]

// ✓ Correct
plugins: [
  pluginOas(),  // Must be first
  pluginTs()
]
```

## Path Resolution Issues

**Issue:** Generated files appear in unexpected locations.

**Cause:** Plugin paths are relative to config `output.path`.

**Solution:**
```typescript
export default defineConfig({
  output: { path: './src/gen' },  // Base directory
  plugins: [
    pluginOas(),
    pluginTs({ 
      output: { path: 'models' }    // → ./src/gen/models
    })
  ]
})
```

## TypeScript Errors in Config

**Error:** Type errors in `kubb.config.ts`

**Solution:** Ensure proper imports and use `defineConfig`:
```typescript
import { defineConfig } from '@kubb/core'

export default defineConfig({
  // Configuration is now fully typed
})
```

## Clean Not Working

**Issue:** Old generated files remain after running Kubb.

**Solution:** Set `clean: true` in output:
```typescript
{
  output: {
    path: './src/gen',
    clean: true  // Remove old files before generating
  }
}
```

## Plugin Not Found

**Error:** `Cannot find module '@kubb/plugin-...'`

**Solution:** Install the plugin package:
```bash
npm install -D @kubb/plugin-ts
npm install -D @kubb/plugin-react-query
# etc.
```

## No Files Generated

**Issue:** Kubb runs but generates no files.

**Possible causes:**
1. **No matching operations:** Check `include`/`exclude` filters
2. **Invalid OpenAPI spec:** Validate your OpenAPI file
3. **Missing plugins:** Ensure plugins array is not empty

**Debug:**
```bash
npx kubb --log-level debug
```
