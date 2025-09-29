# Development Logging System

Comprehensive logging system for tracking all actions during development.

## Features

✅ **Development-only** - Logs only appear in `NODE_ENV=development`
✅ **Color-coded** - Different colors for different log levels
✅ **Structured** - Includes component name, action, and data
✅ **Timestamped** - Every log includes a timestamp
✅ **Type-safe** - Full TypeScript support

## Usage

### Import the logger

```typescript
import { logger } from '@/lib/logger'
```

### Basic Logging

```typescript
// Info
logger.info('User logged in', { component: 'Auth', data: { userId: '123' } })

// Success
logger.success('Data saved successfully')

// Warning
logger.warning('API rate limit approaching')

// Error
logger.error('Failed to load data', { error: new Error('Network error') })

// Debug
logger.debug('Component state updated', { data: { count: 5 } })
```

### Specialized Methods

#### Component Lifecycle

```typescript
// Component mount
useEffect(() => {
  logger.mount('FeedbackPage')
  return () => logger.unmount('FeedbackPage')
}, [])
```

#### Navigation

```typescript
logger.navigation('/events', '/calendar')
```

#### API Calls

```typescript
// Request
logger.apiCall('POST', '/api/feedback', { category: 'general' })

// Response
logger.apiResponse('/api/feedback', 200, { success: true })
```

#### Form Actions

```typescript
// Form submission
logger.formSubmit('FeedbackForm', formData)

// Validation errors
logger.formValidation('FeedbackForm', errors)
```

#### User Actions

```typescript
// Button click
logger.userAction('Click submit button')

// Toggle switch
logger.userAction('Toggle anonymous mode', { anonymous: true })

// Set rating
logger.userAction('Set rating', { rating: 5 })
```

#### State Changes

```typescript
logger.stateChange('Counter', { count: 0 }, { count: 1 })
```

## Log Levels

| Level | Color | Use Case |
|-------|-------|----------|
| `info` | 🔵 Blue | General information |
| `success` | 🟢 Green | Successful operations |
| `warning` | 🟡 Yellow | Warnings and non-critical issues |
| `error` | 🔴 Red | Errors and failures |
| `debug` | 🟣 Purple | Debug information |

## Example Console Output

```
[14:32:15] DEBUG [FeedbackPage]{mount} Component mounted
[14:32:18] INFO [User]{interaction} User action: Toggle anonymous mode
📊 Data: { anonymous: true }
[14:32:25] INFO [User]{interaction} User action: Set rating
📊 Data: { rating: 5 }
[14:32:30] INFO [Form]{submit} Form submitted: Feedback
📊 Data: { category: 'general', subject: 'Test', ... }
[14:32:30] INFO [API]{request} API POST /api/feedback
📊 Data: { category: 'general', isAnonymous: true }
[14:32:31] SUCCESS [API]{response} API Response 200 /api/feedback
📊 Data: { success: true }
[14:32:31] SUCCESS Feedback submitted successfully
```

## Integration Examples

### Feedback Form (Complete)

See `src/app/feedback/page.tsx` for a complete example with:
- Component mount/unmount logging
- Form validation logging
- User interaction logging (toggle, rating)
- API call logging
- Success/error logging

### Adding to New Components

1. **Import the logger:**
   ```typescript
   import { logger } from '@/lib/logger'
   ```

2. **Add lifecycle logging:**
   ```typescript
   useEffect(() => {
     logger.mount('MyComponent')
     return () => logger.unmount('MyComponent')
   }, [])
   ```

3. **Log user actions:**
   ```typescript
   const handleClick = () => {
     logger.userAction('Button clicked', { buttonId: 'submit' })
     // ... your logic
   }
   ```

4. **Log API calls:**
   ```typescript
   const fetchData = async () => {
     logger.apiCall('GET', '/api/data')
     const response = await fetch('/api/data')
     logger.apiResponse('/api/data', response.status)
   }
   ```

## Best Practices

1. **Be specific** - Use descriptive action names
2. **Include context** - Add relevant data to help debugging
3. **Protect sensitive data** - Never log passwords, tokens, or full email addresses
4. **Use appropriate levels** - Choose the right log level for the message
5. **Log state changes** - Track important state transitions
6. **Log errors with context** - Include the error object and context

## Disabling Logs

Logs are automatically disabled in production (`NODE_ENV=production`). No configuration needed!

## Future Enhancements

- [ ] Log persistence (save to local storage)
- [ ] Log export functionality
- [ ] Performance metrics logging
- [ ] Error boundary integration
- [ ] Analytics integration