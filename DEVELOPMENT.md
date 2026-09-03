# Development Guidelines

## Architecture

### Controller → Service → Model Pattern

```
Request → Controller → Service → Model → Database
Response ← Controller ← Service ← Model ← Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define database schemas

## Code Style

### TypeScript
- Use strict mode
- Define all types explicitly
- Avoid `any` type
- Use interfaces for objects

### Error Handling
- Always wrap async functions with `asyncHandler`
- Throw `AppError` for known errors
- Use consistent error response format

### Validation
- Validate all inputs with Joi
- Return 400 for validation errors
- Include detailed error messages

## Testing

Run before committing:
```bash
yarn lint
yarn type-check
```

## Git Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Lint & type-check: `yarn lint && yarn type-check`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/name`
6. Create pull request

## Naming Conventions

- **Files**: `camelCase.ts` or `PascalCase.ts` for classes
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Routes**: `/api/lowercase/lowercase`

## API Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Optional"
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "details": {}
}
```

## Database

### Indexing
- Index frequently queried fields
- Index foreign keys
- Use compound indexes wisely

### Validation
- Validate at schema level
- Provide meaningful error messages
- Use proper data types

## Security Best Practices

1. Always hash passwords with bcryptjs
2. Use JWT for authentication
3. Validate all inputs
4. Sanitize output
5. Use HTTPS in production
6. Set proper CORS origins
7. Use rate limiting
8. Keep secrets in .env files

## Performance

- Use caching where appropriate
- Optimize database queries
- Use pagination for large datasets
- Compress API responses
- Lazy load components

## Documentation

- Add JSDoc comments to functions
- Document API endpoints
- Include setup instructions
- Provide usage examples
